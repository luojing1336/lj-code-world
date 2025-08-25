import { createClient } from "@supabase/supabase-js";
import { netlifyConfig } from "@netlify/config"

export const supabase = createClient(
  netlifyConfig.build.environment.RSPRESS_SUPABASE_URL,
  netlifyConfig.build.environment.RSPRESS_SUPABASE_ANON_KEY
);