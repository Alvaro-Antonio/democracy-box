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
 *
 * Quantidade gerada: soma de n!/(n-k)! para k = 1..n
 *   n=1 → 1 · n=2 → 4 · n=3 → 15 · n=4 → 64 · n=5 → 325
 *
 * Ordem do resultado (define a numeração das chapas):
 *   1. chapas menores primeiro (k = 1, depois 2, …);
 *   2. dentro do mesmo tamanho, ordem lexicográfica pela posição de cada
 *      candidato na lista de entrada (ordem de cadastro).
 */
export function generateChapaRankings(candidateIds: readonly CandidateId[]): CandidateId[][] {
  if (candidateIds.length > MAX_CANDIDATES) {
    throw new Error(`No máximo ${MAX_CANDIDATES} candidatos são permitidos.`);
  }
  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error("A lista de candidatos contém ids duplicados.");
  }

  const result: CandidateId[][] = [];
  const maxSize = Math.min(candidateIds.length, MAX_CHAPA_SIZE);

  for (let size = 1; size <= maxSize; size++) {
    collectPermutations(candidateIds, size, [], new Set<number>(), result);
  }
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
