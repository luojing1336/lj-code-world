import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.RSPRESS_PUBLIC_SUPABASE_URL,
  import.meta.env.RSPRESS_PUBLIC_SUPABASE_ANON_KEY
);