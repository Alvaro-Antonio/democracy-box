import { Trophy, ArrowDownCircle } from "lucide-react";

import { CandidateAvatar } from "@/components/candidate-avatar";
import type { IrvRound } from "@/lib/ranked/irv";
import type { Candidate, CandidateId } from "@/types/domain";

interface RoundsTableProps {
  rounds: IrvRound[];
  candidates: Candidate[];
  winnerId: CandidateId | null;
}

export function RoundsTable({ rounds, candidates, winnerId }: RoundsTableProps) {
  const candidatesById = new Map<CandidateId, Candidate>();
  candidates.forEach((c) => candidatesById.set(c.id, c));

  return (
    <div className="space-y-8">
      {rounds.map((round) => {
        const sortedEntries = Object.entries(round.tallies).sort(
          ([, a], [, b]) => (b as number) - (a as number),
        );

        return (
          <div
            key={round.round}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg"
          >
            <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-mono">
                    R{round.round}
                  </span>
                  Rodada {round.round} de Apuração
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cédulas ativas nesta rodada: <strong>{round.activeBallots}</strong>
                  {round.exhausted > 0 && ` • Cédulas esgotadas acumuladas: ${round.exhausted}`}
                </p>
              </div>

              {round.eliminated && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                  <ArrowDownCircle className="size-3.5" />
                  Eliminado:{" "}
                  <strong>{candidatesById.get(round.eliminated)?.name || "Candidato"}</strong>
                  {round.tieBreak && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      (Desempate: {round.tieBreak === "previous-round" ? "rodada anterior" : "ordem de cadastro"})
                    </span>
                  )}
                </div>
              )}

              {!round.eliminated && winnerId && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold">
                  <Trophy className="size-3.5 text-amber-400" />
                  Vencedor Determinado!
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              {sortedEntries.map(([cid, count]) => {
                const candidate = candidatesById.get(cid);
                const votes = count as number;
                const percentage =
                  round.activeBallots > 0 ? (votes / round.activeBallots) * 100 : 0;
                const isWinner = winnerId === cid && !round.eliminated;
                const isEliminated = round.eliminated === cid;

                return (
                  <div key={cid} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5">
                        <CandidateAvatar candidate={candidate || { name: "?", photoUrl: null }} size="sm" />
                        <span className="font-semibold text-foreground">
                          {candidate?.name || cid}
                        </span>
                        {isWinner && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                            Eleito (&gt; 50%)
                          </span>
                        )}
                        {isEliminated && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            Menor pontuação
                          </span>
                        )}
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="font-bold">{votes}</span>{" "}
                        <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner
                            ? "bg-amber-400"
                            : isEliminated
                            ? "bg-rose-500/60"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
