"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";

import { ChapaCard } from "@/components/chapa-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Candidate, CandidateId, Chapa } from "@/types/domain";

interface ChapaListProps {
  chapas: Chapa[];
  candidates: Candidate[];
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (chapa: Chapa) => void;
}

export function ChapaList({
  chapas,
  candidates,
  selectable = false,
  selectedId,
  onSelect,
}: ChapaListProps) {
  const [search, setSearch] = useState("");
  const [firstPrefFilter, setFirstPrefFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 48;

  const candidatesById = useMemo(() => {
    const map = new Map<CandidateId, Candidate>();
    candidates.forEach((c) => map.set(c.id, c));
    return map;
  }, [candidates]);

  const filteredChapas = useMemo(() => {
    return chapas.filter((chapa) => {

      // Filtro de 1ª preferência
      if (firstPrefFilter !== null && chapa.candidateIds[0] !== firstPrefFilter) {
        return false;
      }

      // Busca por nome de qualquer candidato ranqueado na chapa
      if (search.trim()) {
        const term = search.toLowerCase();
        const matches = chapa.candidateIds.some((cid) => {
          const c = candidatesById.get(cid);
          return c?.name.toLowerCase().includes(term);
        });
        if (!matches) return false;
      }

      return true;
    });
  }, [chapas, firstPrefFilter, search, candidatesById]);

  const paginatedChapas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredChapas.slice(start, start + pageSize);
  }, [filteredChapas, page]);

  const totalPages = Math.ceil(filteredChapas.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card/40 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome de candidato na chapa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <select
            value={firstPrefFilter ?? ""}
            onChange={(e) => {
              setFirstPrefFilter(e.target.value || null);
              setPage(1);
            }}
            className="h-9 px-3 rounded-md bg-background border border-input text-xs font-medium focus:ring-1 focus:ring-ring"
          >
            <option value="">Qualquer 1ª preferência</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                1º lugar: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex justify-between items-center px-1">
        <span>
          Exibindo {paginatedChapas.length} de {filteredChapas.length} chapas encontradas
          {chapas.length > 0 && ` (total de ${chapas.length} no sistema)`}
        </span>
        {totalPages > 1 && (
          <span>
            Página {page} de {totalPages}
          </span>
        )}
      </div>

      {filteredChapas.length === 0 ? (
        <EmptyState
          title="Nenhuma chapa encontrada"
          description="Tente ajustar os filtros ou os termos da sua busca para encontrar opções."
          icon={<Filter className="size-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedChapas.map((chapa) => (
            <ChapaCard
              key={chapa.id}
              chapa={chapa}
              candidatesById={candidatesById}
              selectable={selectable}
              selected={selectedId === chapa.id}
              onSelect={() => onSelect?.(chapa)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
