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
        "relative rounded-xl border p-4 transition-all duration-200 text-left bg-card/60 backdrop-blur-sm",
        selectable && "cursor-pointer hover:border-primary/50 hover:shadow-md hover:shadow-primary/5",
        selected
          ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04]"
          : "border-border/60",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Chapa
          </span>
          <span className="font-mono text-lg font-bold text-foreground">
            #{formatChapaNumber(chapa.number)}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
          {chapa.candidateIds.length}{" "}
          {chapa.candidateIds.length === 1 ? "candidato" : "candidatos"}
        </span>
      </div>

      <div className="space-y-2.5">
        {chapa.candidateIds.map((cid, index) => {
          const candidate = candidatesById.get(cid);
          return (
            <div key={cid} className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold size-5 rounded-full flex items-center justify-center bg-muted text-muted-foreground border border-border/50 shrink-0">
                {index + 1}º
              </span>
              <CandidateAvatar candidate={candidate || { name: "Desconhecido", photoUrl: null }} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight truncate text-foreground">
                  {candidate ? candidate.name : "Candidato Desconhecido"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
