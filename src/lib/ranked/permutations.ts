import type { CandidateId } from "@/types/domain";

/** Limite de candidatos cadastrados (mantém o total de chapas em no máximo 325). */
export const MAX_CANDIDATES = 5;
/** Tamanho máximo de uma chapa (quantidade de posições no ranking). */
export const MAX_CHAPA_SIZE = 5;

/**
 * Gera todas as chapas possíveis: todas as permutações ordenadas de
 * 1 até `min(n, MAX_CHAPA_SIZE)` candidatos.
 *
 * Por que permutações (e não combinações)? Porque no Voto por Ranking a
 * ORDEM importa: [Ana, Bruno] (Ana em 1º) é um voto diferente de
 * [Bruno, Ana] (Bruno em 1º).
/**
 * Gera todas as permutações completas onde TODOS os candidatos registrados
 * estão presentes na chapa (tamanho = número total de candidatos).
 *
 * Exemplo:
 *  - 3 candidatos (A, B, C) → 3! = 6 chapas completas
 *  - 4 candidatos → 4! = 24 chapas completas
 *  - 5 candidatos → 5! = 120 chapas completas
 */
export function generateChapaRankings(candidateIds: readonly CandidateId[]): CandidateId[][] {
  if (candidateIds.length > MAX_CANDIDATES) {
    throw new Error(`No máximo ${MAX_CANDIDATES} candidatos são permitidos.`);
  }
  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error("A lista de candidatos contém ids duplicados.");
  }

  if (candidateIds.length === 0) return [];

  const result: CandidateId[][] = [];
  // Gera apenas permutações completas contendo todos os candidatos
  collectPermutations(candidateIds, candidateIds.length, [], new Set<number>(), result);
  return result;
}

/**
 * Backtracking: escolhe, posição por posição, um candidato ainda não usado.
 * Percorrer os índices em ordem crescente produz naturalmente a ordem
 * lexicográfica.
 */
function collectPermutations(
  pool: readonly CandidateId[],
  size: number,
  current: CandidateId[],
  used: Set<number>,
  out: CandidateId[][],
): void {
  if (current.length === size) {
    out.push([...current]);
    return;
  }
  for (let i = 0; i < pool.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    current.push(pool[i]);
    collectPermutations(pool, size, current, used, out);
    current.pop();
    used.delete(i);
  }
}
