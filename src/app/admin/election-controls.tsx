"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { generateChapas } from "@/app/actions/chapas";
import { closeElection, openElection } from "@/app/actions/election";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ElectionSettings } from "@/types/domain";

interface ElectionControlsProps {
  settings: ElectionSettings;
  candidateCount: number;
  chapasCount: number;
  voteCount: number;
}

export function ElectionControls({
  settings,
  candidateCount,
  chapasCount,
  voteCount,
}: ElectionControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerateChapas = () => {
    startTransition(async () => {
      const result = await generateChapas();
      if (result.ok) {
        toast.success(`${result.data.count} chapas geradas com sucesso!`);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleOpen = () => {
    startTransition(async () => {
      const result = await openElection();
      if (result.ok) {
        toast.success("Votação aberta para os eleitores!");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleClose = () => {
    startTransition(async () => {
      const result = await closeElection();
      if (result.ok) {
        toast.success("Votação encerrada! A apuração dos votos já está disponível.");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {settings.status === "draft" && (
        <>
          <Button
            variant="outline"
            onClick={handleGenerateChapas}
            disabled={isPending || candidateCount === 0 || voteCount > 0}
          >
            {isPending ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="size-4 mr-1.5 text-primary" />
            )}
            {chapasCount > 0 ? "Regerar Chapas" : "Gerar Chapas Automaticamente"}
          </Button>

          <Button
            onClick={handleOpen}
            disabled={isPending || chapasCount === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            {isPending ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="size-4 mr-1.5 fill-current" />
            )}
            Abrir Votação
          </Button>
        </>
      )}

      {settings.status === "open" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending} className="font-semibold">
              <Square className="size-4 mr-1.5 fill-current" />
              Encerrar Votação
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="size-5" />
                Encerrar Definitivamente a Eleição?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é <strong>irreversível</strong>. Nenhum eleitor poderá mais votar
                e a apuração por Instant-Runoff Voting (IRV) será disponibilizada publicamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClose}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Sim, Encerrar Eleição
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {settings.status === "closed" && (
        <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border/40">
          Eleição finalizada. Consulte os resultados na aba pública.
        </span>
      )}
    </div>
  );
}
