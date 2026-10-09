"use client";

import { useMemo, useState, useTransition } from "react";
import { Vote, Loader2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

import { castVote } from "@/app/actions/vote";
import { ChapaList } from "@/components/chapa-list";
import { VoteBuilder } from "@/components/vote-builder";
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
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [selectedChapa, setSelectedChapa] = useState<Chapa | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [voteReceipt, setVoteReceipt] = useState<{
    code: string;
    chapaNumber: number;
    emailSentTo: string | null;
  } | null>(null);

  // Filtra as chapas com base na ordem de preferência que o eleitor construiu
  const matchingChapas = useMemo(() => {
    if (rankedIds.length === 0) return chapas;
    return chapas.filter((chapa) => {
      // Verifica se a chapa começa exatamente com a sequência ordenada
      for (let i = 0; i < rankedIds.length; i++) {
        if (chapa.candidateIds[i] !== rankedIds[i]) return false;
      }
      return true;
    });
  }, [chapas, rankedIds]);

  // Se o filtro resultar em exatamente 1 chapa (ou se todas as posições foram ordenadas),
  // seleciona automaticamente essa chapa para agilizar a experiência
  const handleAddCandidate = (candidateId: string) => {
    const nextRanked = [...rankedIds, candidateId];
    setRankedIds(nextRanked);

    const nextMatching = chapas.filter((chapa) => {
      for (let i = 0; i < nextRanked.length; i++) {
        if (chapa.candidateIds[i] !== nextRanked[i]) return false;
      }
      return true;
    });

    if (nextMatching.length === 1) {
      setSelectedChapa(nextMatching[0]);
    } else if (selectedChapa && !nextMatching.some((c) => c.id === selectedChapa.id)) {
      setSelectedChapa(null);
    }
  };

  const handleRemoveCandidate = (candidateId: string) => {
    const nextRanked = rankedIds.filter((id) => id !== candidateId);
    setRankedIds(nextRanked);

    if (nextRanked.length === 0) {
      setSelectedChapa(null);
      return;
    }

    const nextMatching = chapas.filter((chapa) => {
      for (let i = 0; i < nextRanked.length; i++) {
        if (chapa.candidateIds[i] !== nextRanked[i]) return false;
      }
      return true;
    });

    if (nextMatching.length === 1) {
      setSelectedChapa(nextMatching[0]);
    } else if (selectedChapa && !nextMatching.some((c) => c.id === selectedChapa.id)) {
      setSelectedChapa(null);
    }
  };

  const handleClear = () => {
    setRankedIds([]);
    setSelectedChapa(null);
  };

  const handleSelectChapa = (chapa: Chapa) => {
    setSelectedChapa(chapa);
    // Sincroniza a ordem do construtor com a chapa clicada
    setRankedIds(chapa.candidateIds);
  };

  if (voteReceipt) {
    return (
      <VoteCodeDisplay
        code={voteReceipt.code}
        chapaNumber={voteReceipt.chapaNumber}
        emailSentTo={voteReceipt.emailSentTo}
      />
    );
  }

  const handleConfirmVote = () => {
    if (!selectedChapa) return;

    startTransition(async () => {
      const result = await castVote(selectedChapa.id);
      if (result.ok) {
        setVoteReceipt(result.data);
        setConfirmOpen(false);
        toast.success("Voto computado com sucesso! Comprovante enviado para o seu e-mail.");
      } else {
        toast.error(result.error.message);
        setConfirmOpen(false);
      }
    });
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Aviso 'Como Votar' redesenhado com alto contraste, cor acolhedora e passos claros */}
      <div className="rounded-2xl border-2 border-sky-400/50 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/80 p-5 sm:p-6 shadow-xl shadow-sky-950/40 text-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="size-12 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center shrink-0 shadow-md">
            <Info className="size-6" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                Guia Rápido
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Como Votar pelo Método de Ranking
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Você pode construir o seu voto clicando nos candidatos em ordem de preferência (1º, 2º, 3º...) ou escolher diretamente uma das chapas na lista abaixo. O sistema garante que cada eleitor vote <strong>uma única vez</strong> de forma totalmente secreta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-sky-300 block">Passo 1</span>
              <span className="text-xs font-semibold text-slate-100">Ordene ou Escolha</span>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-300 block">Passo 2</span>
              <span className="text-xs font-semibold text-slate-100">Confirme a Chapa</span>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-300 block">Passo 3</span>
              <span className="text-xs font-semibold text-slate-100">Guarde seu Código</span>
            </div>
          </div>
        </div>
      </div>

      {/* Construtor interativo de voto */}
      {candidates.length > 0 && (
        <VoteBuilder
          candidates={candidates}
          rankedIds={rankedIds}
          onAddCandidate={handleAddCandidate}
          onRemoveCandidate={handleRemoveCandidate}
          onClear={handleClear}
          matchingChapasCount={matchingChapas.length}
          totalChapasCount={chapas.length}
        />
      )}

      {/* Listagem de chapas filtradas */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              Chapas Disponíveis
              {rankedIds.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Filtradas pela sua ordem
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {rankedIds.length > 0
                ? "Mostrando apenas as chapas que iniciam com os candidatos que você selecionou."
                : "Você também pode explorar todas as chapas registradas e clicar diretamente naquela que preferir."}
            </p>
          </div>
        </div>

        <ChapaList
          chapas={matchingChapas}
          candidates={candidates}
          selectable
          selectedId={selectedChapa?.id}
          onSelect={handleSelectChapa}
        />
      </div>

      {/* Barra de ação inferior fixa */}
      {selectedChapa && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 border-t border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-mono font-extrabold text-base shadow-sm">
                #{formatChapaNumber(selectedChapa.number)}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Chapa #{formatChapaNumber(selectedChapa.number)} Selecionada</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Pronta para Voto
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedChapa.candidateIds.length} candidatos ordenados hierarquicamente
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 text-base"
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
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Atenção: uma vez confirmado, o seu voto será registrado e{" "}
                  <strong>não poderá ser alterado nem cancelado</strong>.
                </p>
                <p className="text-xs">
                  Um código único de validação será gerado instantaneamente na sua tela.
                </p>
              </div>
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
