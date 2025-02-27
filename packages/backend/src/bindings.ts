import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Bindings = {
  FRONTEND_URL_SUFFIX: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
};

export type Variables = {
  supabase: SupabaseClient;
  user: User;
  token: string;
};
