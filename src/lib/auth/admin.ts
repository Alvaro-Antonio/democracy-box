import type { User } from "@supabase/supabase-js";

import { adminEmails } from "@/lib/env.server";
import { AppError } from "@/lib/errors";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "./admin-emails";

/**
 * Obtém o usuário atual autenticado ou null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Exige um usuário autenticado. Lança AppError('UNAUTHENTICATED') se ausente.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("UNAUTHENTICATED", "Você precisa estar autenticado para realizar esta ação.");
  }
  return user;
}

/**
 * Exige que o usuário atual seja um administrador válido listado em ADMIN_EMAILS.
 * Lança AppError('UNAUTHENTICATED') ou AppError('FORBIDDEN').
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  const allowed = adminEmails();

  if (!isAdminEmail(user.email, allowed)) {
    throw new AppError("FORBIDDEN", "Acesso restrito a administradores.");
  }
  return user;
}
