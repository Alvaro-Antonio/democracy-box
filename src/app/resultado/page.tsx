import Link from "next/link";
import { Lock } from "lucide-react";

import { ChapaVotesTable } from "@/components/chapa-votes-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResultsSummary } from "@/components/results-summary";
import { RoundsMatrixTable } from "@/components/rounds-matrix-table";
import { RoundsTable } from "@/components/rounds-table";
import { Button } from "@/components/ui/button";
import { getElectionResults } from "@/lib/election/results";

export const metadata = {
  title: "Resultados da Eleição — Democracy Box",
  description: "Relatório de apuração detalhado rodada a rodada pelo método Instant-Runoff Voting.",
};

export default async function ResultsPage() {
  const data = await getElectionResults();

  if (data.status !== "closed" || !data.irv || !data.candidates || !data.chapaVotes) {
    return (
      <div className="space-y-6">
        <PageHeader title="Resultados da Eleição" />
        <EmptyState
          icon={<Lock className="size-6 text-amber-400" />}
          title="A eleição ainda não foi encerrada"
          description="Para garantir o sigilo e a lisura das votações, a apuração completa das rodadas só é liberada após o encerramento formal do pleito pelo administrador."
          action={
            <div className="flex gap-3">
              <Link href="/votar">
                <Button>Ir para a Cabine de Votação</Button>
              </Link>
              <Link href="/como-funciona">
                <Button variant="outline">Entenda o Método de Apuração</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Apuração Oficial da Eleição"
        description="A apuração é calculada rodada por rodada usando o método Instant-Runoff Voting (IRV). Os votos de candidatos eliminados são transferidos para as próximas preferências das cédulas."
      />

      <ResultsSummary irv={data.irv} candidates={data.candidates} />

      {/* Quadro comparativo: quantidade de votos de cada candidato por rodada */}
      <RoundsMatrixTable
        rounds={data.irv.rounds}
        candidates={data.candidates}
        winnerId={data.irv.winner}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Detalhamento Gráfico por Rodada</h2>
          <p className="text-xs text-muted-foreground">
            Acompanhe a eliminação do último colocado e a redistribuição automática de suas cédulas
            até que um candidato conquiste mais de 50% dos votos ativos.
          </p>
        </div>
        <RoundsTable
          rounds={data.irv.rounds}
          candidates={data.candidates}
          winnerId={data.irv.winner}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Depósito Inicial de Cédulas</h2>
          <p className="text-xs text-muted-foreground">
            Total de votos diretos em cada uma das permutações escolhidas pelos eleitores.
          </p>
        </div>
        <ChapaVotesTable chapaVotes={data.chapaVotes} candidates={data.candidates} />
      </div>
    </div>
  );
}
