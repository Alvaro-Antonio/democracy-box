/**
 * Tipos de domínio compartilhados por toda a aplicação.
 * Os componentes e actions trabalham com estes tipos (camelCase),
 * nunca diretamente com as linhas do banco (snake_case).
 */

export type CandidateId = string;

export interface Candidate {
  id: CandidateId;
  name: string;
  description: string | null;
  photoUrl: string | null;
  createdAt: string;
}

/** Uma chapa é um ranking ordenado (1ª preferência primeiro) de 1 a 5 candidatos. */
export interface Chapa {
  id: string;
  number: number;
  candidateIds: CandidateId[];
}

export type ElectionStatus = "draft" | "open" | "closed";

export interface ElectionSettings {
  isOpen: boolean;
  openedAt: string | null;
  closedAt: string | null;
  status: ElectionStatus;
}

export type ActionErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "CONFLICT"
  | "NOT_FOUND"
  | "ELECTION_STATE"
  | "INTERNAL";

/** Resultado padronizado de todas as Server Actions. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string } };
