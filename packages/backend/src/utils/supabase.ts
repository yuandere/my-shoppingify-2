import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient(
  env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  },
  token: string
) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase URL or service key are not set in environment variables."
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
