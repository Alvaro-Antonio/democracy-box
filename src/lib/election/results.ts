import { getCandidates, getElectionSettings } from "@/lib/election/queries";
import { type BallotGroup, type IrvResult, runInstantRunoff } from "@/lib/ranked/irv";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Candidate, Chapa } from "@/types/domain";

export interface ElectionResultsData {
  status: "not-closed" | "closed";
  candidates?: Candidate[];
  chapaVotes?: { chapa: Chapa; votes: number }[];
  irv?: IrvResult;
}

export async function getElectionResults(): Promise<ElectionResultsData> {
  const settings = await getElectionSettings();

  if (settings.status !== "closed") {
    return { status: "not-closed" };
  }

  const [candidates, supabase] = await Promise.all([
    getCandidates(),
    createServerSupabase(),
  ]);

  // Chama RPC protegida chapa_vote_counts()
  const { data: voteCountsData, error } = await supabase.rpc("chapa_vote_counts");

  if (error || !voteCountsData) {
    return { status: "not-closed" };
  }

  const chapaVotes = voteCountsData.map((row) => ({
    chapa: {
      id: row.chapa_id,
      number: row.number,
      candidateIds: Array.isArray(row.candidate_ids) ? (row.candidate_ids as string[]) : [],
    },
    votes: Number(row.votes) || 0,
  }));

  // Agrupa cédulas para o algoritmo puro de IRV
  const ballotGroups: BallotGroup[] = chapaVotes
    .filter((cv) => cv.votes > 0)
    .map((cv) => ({
      ranking: cv.chapa.candidateIds,
      count: cv.votes,
    }));

  // Preserva a ordem de criação dos candidatos para regras de desempate
  const candidateIdsInOrder = candidates.map((c) => c.id);
  const irvResult = runInstantRunoff(candidateIdsInOrder, ballotGroups);

  return {
    status: "closed",
    candidates,
    chapaVotes,
    irv: irvResult,
  };
}
