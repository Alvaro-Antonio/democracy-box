import type { ActionErrorCode, ActionResult } from "@/types/domain";

export class AppError extends Error {
  readonly code: ActionErrorCode;

  constructor(code: ActionErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

/**
 * Converte erros levantados por RPCs ou pelo Supabase em AppError tipados de domínio.
 */
export function mapRpcError(e: { message?: string; code?: string }): AppError {
  const msg = e.message || "";
  const code = e.code || "";

  if (code === "28000" || msg.includes("UNAUTHENTICATED")) {
    return new AppError("UNAUTHENTICATED", "Sessão expirada ou não autenticado.");
  }
  if (msg.includes("ALREADY_VOTED")) {
    return new AppError("CONFLICT", "Você já votou nesta eleição.");
  }
  if (msg.includes("ELECTION_NOT_OPEN")) {
    return new AppError("ELECTION_STATE", "A eleição não está aberta para votação.");
  }
  if (msg.includes("ELECTION_NOT_CLOSED")) {
    return new AppError("ELECTION_STATE", "A apuração só fica disponível após o encerramento da eleição.");
  }
  if (msg.includes("CHAPA_NOT_FOUND")) {
    return new AppError("NOT_FOUND", "A chapa informada não foi encontrada.");
  }
  if (msg.includes("MAX_CANDIDATES")) {
    return new AppError("VALIDATION", "Limite máximo de 5 candidatos atingido.");
  }
  if (msg.includes("CHAPAS_EXIST")) {
    return new AppError("CONFLICT", "Não é permitido alterar candidatos após as chapas terem sido geradas.");
  }

  return new AppError("INTERNAL", msg || "Ocorreu um erro interno.");
}

/**
 * Envolve uma execução em um ActionResult seguro para retorno ao client.
 */
export async function toActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { ok: false, error: { code: err.code, message: err.message } };
    }
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { ok: false, error: { code: "INTERNAL", message } };
  }
}
