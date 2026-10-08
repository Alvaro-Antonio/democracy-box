import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/types/database";

/**
 * Cliente exclusivo do servidor com Service Role.
 * Usado APENAS após validações estritas de privilégios de Admin.
 */
export function createAdminSupabase(): SupabaseClient<Database> {
  const { supabaseUrl, serviceRoleKey } = serverEnv();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
