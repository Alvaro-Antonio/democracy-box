import type { CandidateId } from "@/types/domain";

/**
 * Apuração por Instant-Runoff Voting (IRV) — "segundo turno instantâneo".
 *
 * Como funciona:
 *  1. Cada cédula conta para o candidato MAIS BEM RANQUEADO que ainda
 *     não foi eliminado.
 *  2. Se alguém tiver MAIS DE 50% das cédulas ativas, vence.
 *  3. Caso contrário, o candidato com menos votos é eliminado e suas
 *     cédulas passam para a próxima preferência de cada eleitor.
 *  4. Repete até haver vencedor (ou restar um único candidato).
 *
 * Cédula ESGOTADA: todos os candidatos que ela ranqueou já foram
 * eliminados. Ela deixa de contar no total ("cédulas ativas") da rodada.
 *
 * Desempate na eliminação (quando vários empatam com menos votos):
 *  a) olha as rodadas anteriores, da mais recente para a primeira, e
 *     elimina quem tinha menos votos lá ("previous-round");
 *  b) persistindo o empate, elimina o candidato cadastrado por último
 *     ("registration-order").
 */

export interface BallotGroup {
  /** Ranking da cédula, 1ª preferência primeiro. */
  ranking: CandidateId[];
  /** Quantas cédulas idênticas existem (votos na mesma chapa). */
  count: number;
}

export type TieBreakRule = "previous-round" | "registration-order";

export interface IrvRound {
  round: number;
  tallies: Record<CandidateId, number>;
  activeBallots: number;
  exhausted: number;
  eliminated: CandidateId | null;
  tieBreak: TieBreakRule | null;
}

export interface IrvResult {
  totalBallots: number;
  rounds: IrvRound[];
  winner: CandidateId | null;
}

/**
 * @param candidates todos os candidatos, EM ORDEM DE CADASTRO (usada no desempate final).
 * @param ballots    cédulas agrupadas por ranking.
 */
export function runInstantRunoff(
  candidates: readonly CandidateId[],
  ballots: readonly BallotGroup[],
): IrvResult {
  const known = new Set(candidates);
  // Remove da cédula qualquer id que não seja um candidato conhecido.
  const cleanBallots = ballots
    .filter((b) => b.count > 0)
    .map((b) => ({ ranking: b.ranking.filter((id) => known.has(id)), count: b.count }));

  const totalBallots = cleanBallots.reduce((sum, b) => sum + b.count, 0);
  if (totalBallots === 0 || candidates.length === 0) {
    return { totalBallots, rounds: [], winner: null };
  }

  const eliminated = new Set<CandidateId>();
  const rounds: IrvRound[] = [];

  for (let roundNumber = 1; ; roundNumber++) {
    const remaining = candidates.filter((c) => !eliminated.has(c));
    const { tallies, exhausted } = countRound(remaining, eliminated, cleanBallots);
    const activeBallots = totalBallots - exhausted;

    // Vitória: único restante, ou maioria absoluta das cédulas ativas.
    const leader = remaining.reduce((best, c) => (tallies[c] > tallies[best] ? c : best));
    if (remaining.length === 1 || tallies[leader] * 2 > activeBallots) {
      rounds.push({ round: roundNumber, tallies, activeBallots, exhausted, eliminated: null, tieBreak: null });
      return { totalBallots, rounds, winner: leader };
    }

    const { loser, tieBreak } = pickLoser(remaining, tallies, rounds, candidates);
    rounds.push({ round: roundNumber, tallies, activeBallots, exhausted, eliminated: loser, tieBreak });
    eliminated.add(loser);
  }
}

/** Conta a rodada: cada cédula vai para sua preferência mais alta ainda ativa. */
function countRound(
  remaining: readonly CandidateId[],
  eliminated: ReadonlySet<CandidateId>,
  ballots: readonly BallotGroup[],
): { tallies: Record<CandidateId, number>; exhausted: number } {
  const tallies: Record<CandidateId, number> = {};
  for (const c of remaining) tallies[c] = 0;

  let exhausted = 0;
  for (const ballot of ballots) {
    const choice = ballot.ranking.find((id) => !eliminated.has(id));
    if (choice === undefined) exhausted += ballot.count;
    else tallies[choice] += ballot.count;
  }
  return { tallies, exhausted };
}

/** Escolhe quem será eliminado, aplicando as regras de desempate documentadas acima. */
function pickLoser(
  remaining: readonly CandidateId[],
  tallies: Record<CandidateId, number>,
  previousRounds: readonly IrvRound[],
  registrationOrder: readonly CandidateId[],
): { loser: CandidateId; tieBreak: TieBreakRule | null } {
  let tied = lowest(remaining, (c) => tallies[c]);
  if (tied.length === 1) return { loser: tied[0], tieBreak: null };

  // a) Rodadas anteriores, da mais recente para a primeira.
  for (let i = previousRounds.length - 1; i >= 0 && tied.length > 1; i--) {
    const past = previousRounds[i].tallies;
    tied = lowest(tied, (c) => past[c] ?? 0);
  }
  if (tied.length === 1) return { loser: tied[0], tieBreak: "previous-round" };

  // b) Cadastrado por último.
  const loser = tied.reduce((last, c) =>
    registrationOrder.indexOf(c) > registrationOrder.indexOf(last) ? c : last,
  );
  return { loser, tieBreak: "registration-order" };
}

function lowest(ids: readonly CandidateId[], score: (id: CandidateId) => number): CandidateId[] {
  const min = Math.min(...ids.map(score));
  return ids.filter((id) => score(id) === min);
}
