import { CandidateAvatar } from "@/components/candidate-avatar";
import type { IrvRound } from "@/lib/ranked/irv";
import type { Candidate, CandidateId } from "@/types/domain";

interface RoundsMatrixTableProps {
  rounds: IrvRound[];
  candidates: Candidate[];
  winnerId: CandidateId | null;
}

export function RoundsMatrixTable({ rounds, candidates, winnerId }: RoundsMatrixTableProps) {
  const candidatesById = new Map<CandidateId, Candidate>();
  candidates.forEach((c) => candidatesById.set(c.id, c));

  // Identifica em qual rodada cada candidato foi eliminado (se foi)
  const eliminationRoundMap = new Map<CandidateId, number>();
  rounds.forEach((r) => {
    if (r.eliminated) {
      eliminationRoundMap.set(r.eliminated, r.round);
    }
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <h3 className="font-extrabold text-base text-foreground">
          Quadro Comparativo: Votos por Candidato em Cada Rodada
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Veja a evolução exata da quantidade de votos de cada candidato conforme as cédulas foram redistribuídas rodada a rodada.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
              <th className="py-3 px-4 min-w-[200px]">Candidato</th>
              {rounds.map((round) => (
                <th key={round.round} className="py-3 px-4 text-center min-w-[130px]">
                  <span className="block font-bold text-foreground">
                    Rodada {round.round}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    {round.activeBallots} votos ativos
                  </span>
                </th>
              ))}
              <th className="py-3 px-4 text-center min-w-[140px]">Resultado Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {candidates.map((candidate) => {
              const isWinner = winnerId === candidate.id;
              const eliminatedInRound = eliminationRoundMap.get(candidate.id);

              return (
                <tr
                  key={candidate.id}
                  className={`transition-colors hover:bg-muted/30 ${
                    isWinner ? "bg-amber-500/5 font-medium" : ""
                  }`}
                >
                  {/* Nome e Foto do Candidato */}
                  <td className="py-3.5 px-4 flex items-center gap-2.5">
                    <CandidateAvatar candidate={candidate} size="sm" />
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground block truncate">
                        {candidate.name}
                      </span>
                      {isWinner && (
                        <span className="text-[10px] text-amber-400 font-bold">
                          ★ Eleito
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Votos em Cada Rodada */}
                  {rounds.map((round, idx) => {
                    const hasVotes = candidate.id in round.tallies;
                    const votes = hasVotes ? round.tallies[candidate.id] : null;
                    const pct =
                      votes !== null && round.activeBallots > 0
                        ? (votes / round.activeBallots) * 100
                        : 0;

                    // Diferença em relação à rodada anterior (transferência de votos)
                    const prevRound = idx > 0 ? rounds[idx - 1] : null;
                    const prevVotes =
                      prevRound && candidate.id in prevRound.tallies
                        ? prevRound.tallies[candidate.id]
                        : null;
                    const diff =
                      votes !== null && prevVotes !== null ? votes - prevVotes : null;

                    const isEliminatedThisRound = round.eliminated === candidate.id;
                    const wasAlreadyEliminated =
                      eliminatedInRound !== undefined && eliminatedInRound < round.round;

                    return (
                      <td key={round.round} className="py-3.5 px-4 text-center align-middle">
                        {votes !== null ? (
                          <div className="space-y-0.5">
                            <div className="font-mono font-bold text-foreground text-sm">
                              {votes}{" "}
                              <span className="text-[11px] text-muted-foreground font-normal">
                                ({pct.toFixed(1)}%)
                              </span>
                            </div>

                            {/* Indicador de votos recebidos na transferência */}
                            {diff !== null && diff > 0 && (
                              <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                                +{diff} recebidos
                              </span>
                            )}

                            {isEliminatedThisRound && (
                              <span className="inline-block text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">
                                Eliminado nesta rodada
                              </span>
                            )}
                          </div>
                        ) : wasAlreadyEliminated ? (
                          <span className="text-xs text-muted-foreground/60 italic font-mono">
                            —
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 font-mono">
                            0 votos
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Coluna de Status Final */}
                  <td className="py-3.5 px-4 text-center align-middle">
                    {isWinner ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full shadow-sm">
                        🏆 Vencedor
                      </span>
                    ) : eliminatedInRound !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        Eliminado na R{eliminatedInRound}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Finalista</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Rodapé com Estatísticas das Rodadas */}
          <tfoot className="border-t-2 border-border/80 bg-muted/40 text-xs font-semibold">
            <tr>
              <td className="py-2.5 px-4 text-muted-foreground">Cédulas Ativas</td>
              {rounds.map((round) => (
                <td key={round.round} className="py-2.5 px-4 text-center font-mono text-foreground font-bold">
                  {round.activeBallots}
                </td>
              ))}
              <td className="py-2.5 px-4 text-center text-muted-foreground font-mono">—</td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-muted-foreground">Meta Maioria Absoluta (&gt; 50%)</td>
              {rounds.map((round) => {
                const threshold = Math.floor(round.activeBallots / 2) + 1;
                return (
                  <td key={round.round} className="py-2 px-4 text-center font-mono text-emerald-400">
                    {threshold} votos
                  </td>
                );
              })}
              <td className="py-2 px-4 text-center text-muted-foreground font-mono">—</td>
            </tr>
            {rounds.some((r) => r.exhausted > 0) && (
              <tr>
                <td className="py-2 px-4 text-muted-foreground">Cédulas Esgotadas Acumuladas</td>
                {rounds.map((round) => (
                  <td key={round.round} className="py-2 px-4 text-center font-mono text-amber-400">
                    {round.exhausted}
                  </td>
                ))}
                <td className="py-2 px-4 text-center text-muted-foreground font-mono">—</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}
