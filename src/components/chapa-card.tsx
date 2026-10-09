import { formatChapaNumber } from "@/lib/ranked/vote-code";
import { cn } from "@/lib/utils";
import type { Candidate, CandidateId, Chapa } from "@/types/domain";
import { CandidateAvatar } from "./candidate-avatar";

interface ChapaCardProps {
  chapa: Chapa;
  candidatesById: Map<CandidateId, Candidate>;
  selected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export function ChapaCard({
  chapa,
  candidatesById,
  selected = false,
  onSelect,
  selectable = false,
}: ChapaCardProps) {
  return (
    <div
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-200 text-left backdrop-blur-sm",
        selectable && "cursor-pointer hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10",
        selected
          ? "border-2 border-emerald-400 bg-gradient-to-br from-emerald-950/80 via-emerald-900/50 to-slate-950 ring-2 ring-emerald-400/80 shadow-xl shadow-emerald-500/20 text-emerald-50 scale-[1.01]"
          : "border-border/60 bg-card/60 hover:bg-card/90",
      )}
    >
      {selected && (
        <span className="absolute -top-3 right-3 bg-emerald-400 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-emerald-300">
          ✓ Selecionada
        </span>
      )}

      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-mono text-xs uppercase tracking-wider",
            selected ? "text-emerald-300/80 font-bold" : "text-muted-foreground"
          )}>
            Chapa
          </span>
          <span className={cn(
            "font-mono text-lg font-extrabold",
            selected ? "text-emerald-300" : "text-foreground"
          )}>
            #{formatChapaNumber(chapa.number)}
          </span>
        </div>
        <span className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-md border",
          selected
            ? "bg-emerald-400/20 text-emerald-200 border-emerald-400/40"
            : "text-muted-foreground bg-muted/50 border-border/40"
        )}>
          {chapa.candidateIds.length}{" "}
          {chapa.candidateIds.length === 1 ? "candidato" : "candidatos"}
        </span>
      </div>

      <div className="space-y-2.5">
        {chapa.candidateIds.map((cid, index) => {
          const candidate = candidatesById.get(cid);
          return (
            <div key={cid} className="flex items-center gap-2.5">
              <span className={cn(
                "font-mono text-xs font-bold size-5 rounded-full flex items-center justify-center border shrink-0",
                selected
                  ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                  : "bg-muted text-muted-foreground border-border/50"
              )}>
                {index + 1}º
              </span>
              <CandidateAvatar candidate={candidate || { name: "Desconhecido", photoUrl: null }} size="sm" />
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-medium leading-tight truncate",
                  selected ? "text-white font-semibold" : "text-foreground"
                )}>
                  {candidate ? candidate.name : "Candidato Desconhecido"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectable && (
        <div className="mt-3.5 pt-2.5 border-t border-border/30 flex items-center justify-between text-xs">
          <span className={cn(
            "font-medium",
            selected ? "text-emerald-300 font-bold" : "text-muted-foreground"
          )}>
            {selected ? "✓ Opção escolhida para votar" : "Clique para selecionar"}
          </span>
          {selected && (
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}
