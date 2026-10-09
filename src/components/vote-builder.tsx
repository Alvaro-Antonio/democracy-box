"use client";

import { useMemo } from "react";
import { Sparkles, RotateCcw, X, Plus, CheckCircle2 } from "lucide-react";

import { CandidateAvatar } from "@/components/candidate-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Candidate, CandidateId } from "@/types/domain";

interface VoteBuilderProps {
  candidates: Candidate[];
  rankedIds: string[];
  onAddCandidate: (candidateId: string) => void;
  onRemoveCandidate: (candidateId: string) => void;
  onClear: () => void;
  matchingChapasCount: number;
  totalChapasCount: number;
}

const rankLabels = ["1ª Opção", "2ª Opção", "3ª Opção", "4ª Opção", "5ª Opção"];
const rankBadgeStyles = [
  "bg-amber-500/20 text-amber-300 border-amber-500/40", // 1º lugar Ouro
  "bg-slate-300/20 text-slate-200 border-slate-300/40", // 2º lugar Prata
  "bg-amber-700/20 text-amber-400 border-amber-700/40", // 3º lugar Bronze
  "bg-blue-500/20 text-blue-300 border-blue-500/40",   // 4º lugar
  "bg-purple-500/20 text-purple-300 border-purple-500/40", // 5º lugar
];

export function VoteBuilder({
  candidates,
  rankedIds,
  onAddCandidate,
  onRemoveCandidate,
  onClear,
  matchingChapasCount,
  totalChapasCount,
}: VoteBuilderProps) {
  const candidatesById = useMemo(() => {
    const map = new Map<CandidateId, Candidate>();
    candidates.forEach((c) => map.set(c.id, c));
    return map;
  }, [candidates]);

  // Candidatos ainda não selecionados
  const availableCandidates = useMemo(() => {
    const rankedSet = new Set(rankedIds);
    return candidates.filter((c) => !rankedSet.has(c.id));
  }, [candidates, rankedIds]);

  const allRanked = candidates.length > 0 && availableCandidates.length === 0;

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-6">
      {/* Cabeçalho do Construtor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              Construa o seu Voto por Preferência
              {rankedIds.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {rankedIds.length} de {candidates.length} definidos
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selecione os candidatos na ordem do seu favoritismo. O sistema filtra automaticamente as chapas correspondentes.
            </p>
          </div>
        </div>

        {rankedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted self-start sm:self-center"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Limpar escolhas
          </Button>
        )}
      </div>

      {/* Ordem de Preferência Atual do Eleitor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sua Ordem de Voto:
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {matchingChapasCount === 1 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                1 chapa exata encontrada
              </span>
            ) : (
              <span>
                {matchingChapasCount} de {totalChapasCount} chapas compatíveis
              </span>
            )}
          </span>
        </div>

        {rankedIds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <p className="text-sm font-medium text-foreground/80">
              Nenhum candidato selecionado na ordem ainda.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em um dos candidatos abaixo para definir quem é a sua <strong>1ª opção de voto</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {rankedIds.map((cid, index) => {
              const candidate = candidatesById.get(cid);
              const badgeStyle = rankBadgeStyles[index] || "bg-muted text-muted-foreground border-border";
              const label = rankLabels[index] || `${index + 1}ª Opção`;

              return (
                <div
                  key={cid}
                  className="relative group rounded-xl border border-border/80 bg-background/90 p-3 shadow-sm flex items-center justify-between gap-2.5 transition-all hover:border-primary/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "size-6 rounded-md font-mono text-xs font-bold flex items-center justify-center border shrink-0",
                        badgeStyle,
                      )}
                    >
                      {index + 1}º
                    </span>
                    <CandidateAvatar
                      candidate={candidate || { name: "Desconhecido", photoUrl: null }}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                        {label}
                      </span>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {candidate?.name || "Desconhecido"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveCandidate(cid)}
                    title={`Remover ${candidate?.name} da ordem`}
                    className="size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidatos Disponíveis para Adicionar */}
      {!allRanked && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {rankedIds.length === 0
                ? "Escolha seu 1º colocado:"
                : `Escolha seu ${rankedIds.length + 1}º colocado:`}
            </span>
            <span className="text-xs text-muted-foreground">
              Clique para adicionar na próxima posição
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onAddCandidate(candidate.id)}
                className="group relative rounded-xl border border-border/70 bg-background/60 hover:bg-card/90 hover:border-primary p-3.5 text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CandidateAvatar candidate={candidate} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {candidate.name}
                    </p>
                    {candidate.description ? (
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {candidate.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Candidato registrado</p>
                    )}
                  </div>
                </div>

                <div className="size-7 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground text-primary flex items-center justify-center shrink-0 border border-primary/20 transition-all">
                  <Plus className="size-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Caso todos os candidatos já tenham sido ordenados */}
      {allRanked && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Ordem completa definida com sucesso!
              </p>
              <p className="text-xs text-emerald-200/80">
                A chapa correspondente à sua exata preferência foi selecionada abaixo. Revise e confirme o seu voto.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
