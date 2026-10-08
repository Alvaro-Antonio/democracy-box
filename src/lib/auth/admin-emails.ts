/**
 * Utilitários para tratamento e identificação de e-mails de administradores.
 */

export function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

export function isAdminEmail(email: string | null | undefined, admins: readonly string[]): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return admins.includes(normalized);
}
