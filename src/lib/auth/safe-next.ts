/**
 * Higieniza o parâmetro `next` para redirecionamento após autenticação,
 * impedindo ataques de Open Redirect.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  const trimmed = raw.trim();

  // Precisa começar com '/', mas não com '//' (que o navegador trataria como URL de protocolo relativo)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  // Não pode conter dois pontos antes de query string ou barra (ex: 'javascript:')
  const pathPart = trimmed.split("?")[0] || "";
  if (pathPart.includes(":")) {
    return "/";
  }

  return trimmed;
}
