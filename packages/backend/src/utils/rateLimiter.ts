import { DurableObject } from "cloudflare:workers";

export interface Env {
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
}

interface RateLimiterConfig {
  milliseconds_per_request: number;
  milliseconds_for_grace_period: number;
}

// Durable Object
export class RateLimiter extends DurableObject {
  static readonly GENERATE_ROUTE_SUFFIX = "_generate_limit";
  static readonly defaultConfig: RateLimiterConfig = {
    milliseconds_per_request: 1,
    milliseconds_for_grace_period: 5000,
  };
  static readonly generateRouteConfig: RateLimiterConfig = {
    milliseconds_per_request: 10000, // 1 request per 10 seconds
    milliseconds_for_grace_period: 1000,
  };

  private config!: RateLimiterConfig;
  private initialized: boolean = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    const idName = this.ctx.id.name || "";
    if (idName.endsWith(RateLimiter.GENERATE_ROUTE_SUFFIX)) {
      this.config = RateLimiter.generateRouteConfig;
    } else {
      this.config = RateLimiter.defaultConfig;
    }

    this.ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS limit_state (key TEXT PRIMARY KEY, value INTEGER);`
    );
    this.initialized = true;
  }

  async getMillisecondsToNextRequest(): Promise<number> {
    await this.initialize(); // Ensures this.config is set and table exists

    const now = Date.now();
    let storedNextAllowedTime = 0;
    type NextAllowedTimeRow = { value: number };

    // --- Read the current stored nextAllowedTime ---
    // This transaction is for the read operation.
    await this.ctx.storage.transaction(async () => {
        // Using the same SQL access pattern as in the original code for consistency
        const result = this.ctx.storage.sql
            .exec<NextAllowedTimeRow>(`SELECT value FROM limit_state WHERE key = 'nextAllowedTime';`)
            .toArray();
        
        // console.log(`RateLimiter (${this.ctx.id.name}): Read from storage - result: ${JSON.stringify(result)}`);

        if (result.length > 0 && result[0] && typeof result[0].value === 'number') {
            storedNextAllowedTime = result[0].value;
        } else {
            // If no value, or malformed, treat as if no limit was set previously
            storedNextAllowedTime = 0; 
        }
        // console.log(`RateLimiter (${this.ctx.id.name}): Read from storage - storedNextAllowedTime: ${storedNextAllowedTime}`);
    });

    // --- Decide if the current request is rate-limited ---
    let waitMilliseconds = 0;
    if (now < storedNextAllowedTime) {
        // Current time is before the time the next request is allowed.
        const timeUntilAllowed = storedNextAllowedTime - now;
        if (timeUntilAllowed > this.config.milliseconds_for_grace_period) {
            // The request is too early, even considering the grace period.
            waitMilliseconds = timeUntilAllowed - this.config.milliseconds_for_grace_period;
        }
        // else: Request is early, but within the grace period. waitMilliseconds remains 0.
    }
    // else: Current time is at or after storedNextAllowedTime. Request is allowed. waitMilliseconds remains 0.
    
    // console.log(`RateLimiter (${this.ctx.id.name}): Decision - now: ${now}, storedNextAllowedTime: ${storedNextAllowedTime}, grace: ${this.config.milliseconds_for_grace_period}, calculated waitMilliseconds: ${waitMilliseconds}`);

    // --- Update nextAllowedTime for future requests ---
    // The new baseline for calculating the next allowed slot is the later of:
    // - the current time (if the slot was in the past or current request is on time)
    // - the existing storedNextAllowedTime (if the slot is in the future, ensuring we don't go backward)
    const newBaseline = Math.max(now, storedNextAllowedTime);
    const newNextAllowedTimeForStorage = newBaseline + this.config.milliseconds_per_request;

    // This transaction is for the write operation.
    await this.ctx.storage.transaction(async () => {
        this.ctx.storage.sql.exec(
            `INSERT OR REPLACE INTO limit_state (key, value) VALUES ('nextAllowedTime', ?1);`,
            newNextAllowedTimeForStorage
        );
        // console.log(`RateLimiter (${this.ctx.id.name}): Written to storage - newNextAllowedTimeForStorage: ${newNextAllowedTimeForStorage}`);
    });
    
    return waitMilliseconds;
  }
}
