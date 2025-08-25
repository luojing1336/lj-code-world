import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.RSPRESS_SUPABASE_URL,
  process.env.RSPRESS_SUPABASE_ANON_KEY
);