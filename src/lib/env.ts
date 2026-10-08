/**
 * Leitura e validação centralizada das variáveis de ambiente.
 *
 * - `publicEnv`: valores seguros para o navegador (NEXT_PUBLIC_*).
 * - `serverEnv()`: inclui segredos; só pode ser chamado no servidor
 *   (ver `src/lib/env.server.ts`, que importa `server-only`).
 */

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Variável de ambiente ausente: ${name}. Copie .env.example para .env.local e preencha os valores.`,
    );
    this.name = "MissingEnvError";
  }
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") throw new MissingEnvError(name);
  return value.trim();
}

/**
 * Next.js só embute variáveis NEXT_PUBLIC_* no bundle do cliente quando
 * acessadas literalmente (process.env.NOME), por isso não usamos acesso dinâmico.
 */
export function getPublicEnv(): { supabaseUrl: string; supabaseAnonKey: string; siteUrl: string } {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}
