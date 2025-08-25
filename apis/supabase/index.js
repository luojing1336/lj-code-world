import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.RSPRESS_SUPABASE_URL,
  import.meta.env.RSPRESS_SUPABASE_ANON_KEY
);