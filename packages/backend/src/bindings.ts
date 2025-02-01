import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Bindings = {
  SUPABASE_ANON_KEY: string;
  SUPABASE_URL: string;
};

export type Variables = {
  supabase: SupabaseClient;
  user: User;
  token: string;
};
