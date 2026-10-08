import { Trophy, Award } from "lucide-react";

import { CandidateAvatar } from "@/components/candidate-avatar";
import type { IrvResult } from "@/lib/ranked/irv";
import type { Candidate, CandidateId } from "@/types/domain";

interface ResultsSummaryProps {
  irv: IrvResult;
  candidates: Candidate[];
}

export function ResultsSummary({ irv, candidates }: ResultsSummaryProps) {
  const candidatesById = new Map<CandidateId, Candidate>();
  candidates.forEach((c) => candidatesById.set(c.id, c));

  const winner = irv.winner ? candidatesById.get(irv.winner) : null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card/70 to-card/90 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="relative">
          <div className="size-24 sm:size-28 rounded-full ring-4 ring-amber-400/30 flex items-center justify-center bg-amber-400/10">
            {winner ? (
              <CandidateAvatar candidate={winner} size="xl" />
            ) : (
              <Trophy className="size-12 text-amber-400" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
            <Trophy className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Award className="size-3.5" />
            Vencedor por Voto por Ranking
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {winner ? winner.name : "Nenhum Vencedor (Sem Votos)"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            {winner
              ? `Eleito após ${irv.rounds.length} ${
                  irv.rounds.length === 1 ? "rodada" : "rodadas"
                } de apuração com a maioria absoluta das preferências populares.`
              : "Não foram computadas cédulas válidas para apurar um resultado nesta eleição."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50 text-center">
        <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
          <div className="text-xl sm:text-2xl font-bold font-mono">{irv.totalBallots}</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Cédulas Depositadas
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
          <div className="text-xl sm:text-2xl font-bold font-mono">{irv.rounds.length}</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Rodadas de Eliminação
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/40 col-span-2 sm:col-span-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {irv.winner ? "> 50%" : "0%"}
          </div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Maioria Atingida
          </div>
        </div>
      </div>
    </div>
  );
}
