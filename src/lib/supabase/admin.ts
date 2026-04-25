import { createClient } from "@supabase/supabase-js";

/**
 * Service role ile Supabase client. RLS'i BYPASS eder.
 * Sadece trusted server kodunda kullan (route handler, server action, cron).
 * Asla client bundle'a sızmamalı.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
