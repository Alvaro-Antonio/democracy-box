"use client";

import { useState, useTransition } from "react";
import { Vote, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { castVote } from "@/app/actions/vote";
import { ChapaList } from "@/components/chapa-list";
import { VoteCodeDisplay } from "@/components/vote-code-display";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatChapaNumber } from "@/lib/ranked/vote-code";
import type { Candidate, Chapa } from "@/types/domain";

interface VotePanelProps {
  chapas: Chapa[];
  candidates: Candidate[];
}

export function VotePanel({ chapas, candidates }: VotePanelProps) {
  const [selectedChapa, setSelectedChapa] = useState<Chapa | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [voteReceipt, setVoteReceipt] = useState<{ code: string; chapaNumber: number } | null>(null);

  if (voteReceipt) {
    return <VoteCodeDisplay code={voteReceipt.code} chapaNumber={voteReceipt.chapaNumber} />;
  }

  const handleConfirmVote = () => {
    if (!selectedChapa) return;

    startTransition(async () => {
      const result = await castVote(selectedChapa.id);
      if (result.ok) {
        setVoteReceipt(result.data);
        setConfirmOpen(false);
        toast.success("Voto computado com sucesso!");
      } else {
        toast.error(result.error.message);
        setConfirmOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
        <strong>Como votar:</strong> Escolha uma das chapas abaixo (que representam ordens de
        preferência de 1 até 5 candidatos). Você pode buscar pelo nome de um candidato ou filtrar
        pelo tamanho da chapa. <u>Cada eleitor vota uma única vez</u>.
      </div>

      <ChapaList
        chapas={chapas}
        candidates={candidates}
        selectable
        selectedId={selectedChapa?.id}
        onSelect={(chapa) => setSelectedChapa(chapa)}
      />

      {/* Barra de ação inferior fixa */}
      {selectedChapa && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 border-t border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary">
                #{formatChapaNumber(selectedChapa.number)}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">
                  Chapa #{formatChapaNumber(selectedChapa.number)} Selecionada
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedChapa.candidateIds.length} preferência(s) definida(s)
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto font-bold shadow-lg"
              onClick={() => setConfirmOpen(true)}
            >
              <Vote className="size-5 mr-2" />
              Confirmar Escolha e Votar
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmação de voto */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-400" />
              Confirmar Voto na Chapa #{selectedChapa ? formatChapaNumber(selectedChapa.number) : ""}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Atenção: uma vez confirmado, o seu voto será registrado e{" "}
                <strong>não poderá ser alterado nem cancelado</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Um código único de validação será gerado instantaneamente na sua tela.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Revisar Escolha</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmVote}
              className="font-bold"
            >
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Sim, Depositar Voto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
