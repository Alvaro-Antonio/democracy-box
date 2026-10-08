import { CheckCircle2, Clock, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ElectionStatus } from "@/types/domain";

interface ElectionStatusBadgeProps {
  status: ElectionStatus;
}

export function ElectionStatusBadge({ status }: ElectionStatusBadgeProps) {
  if (status === "open") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
        <CheckCircle2 className="size-3.5" />
        Votação Aberta
      </Badge>
    );
  }

  if (status === "closed") {
    return (
      <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 gap-1.5 py-1 px-3">
        <Lock className="size-3.5" />
        Votação Encerrada
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1.5 py-1 px-3">
      <Clock className="size-3.5" />
      Em Preparação (Rascunho)
    </Badge>
  );
}
