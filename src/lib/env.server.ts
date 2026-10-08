import "server-only";

import { getPublicEnv, MissingEnvError } from "./env";
import { parseAdminEmails } from "./auth/admin-emails";

/** Variáveis de ambiente exclusivas do servidor (contêm segredos). */
export function serverEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey: string;
  adminEmails: string[];
} {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) throw new MissingEnvError("SUPABASE_SERVICE_ROLE_KEY");
  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
    adminEmails: parseAdminEmails(process.env.ADMIN_EMAILS),
  };
}

/** Lista de admins sem exigir a service role (usada no middleware e no header). */
export function adminEmails(): string[] {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}
