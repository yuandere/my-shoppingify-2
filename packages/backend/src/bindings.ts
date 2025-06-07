import type { SupabaseClient, User } from "@supabase/supabase-js";
import { RateLimiter } from "./utils/rateLimiter";

export type Bindings = {
  FRONTEND_URL_SUFFIX: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  GEMINI_API_KEY: string;
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
};

export type Variables = {
  supabase: SupabaseClient;
  user: User;
  token: string;
};
