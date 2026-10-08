import Link from "next/link";
import { CheckCircle2, Clock, Lock, Vote } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getCandidates, getChapas, getElectionSettings, hasVoted } from "@/lib/election/queries";
import { VotePanel } from "./vote-panel";

export const metadata = {
  title: "Votar — Democracy Box",
};

export default async function VotePage() {
  const [candidates, chapas, settings, userHasVoted] = await Promise.all([
    getCandidates(),
    getChapas(),
    getElectionSettings(),
    hasVoted(),
  ]);

  if (settings.status === "closed") {
    return (
      <div className="space-y-6">
        <PageHeader title="Votação Encerrada" />
        <EmptyState
          icon={<Lock className="size-6 text-rose-400" />}
          title="O período de votação terminou"
          description="A urna foi encerrada pelo administrador. Você pode conferir os resultados e as rodadas de apuração agora mesmo."
          action={
            <Link href="/resultado">
              <Button>Ver Resultados da Apuração</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (settings.status === "draft") {
    return (
      <div className="space-y-6">
        <PageHeader title="Urna em Preparação" />
        <EmptyState
          icon={<Clock className="size-6 text-amber-400" />}
          title="A eleição ainda não foi aberta"
          description="A administração está finalizando o cadastro de candidatos e chapas. Volte em breve quando o pleito for aberto."
          action={
            <Link href="/como-funciona">
              <Button variant="outline">Entenda Como Funciona o Voto por Ranking</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (userHasVoted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Voto Já Registrado" />
        <EmptyState
          icon={<CheckCircle2 className="size-6 text-emerald-400" />}
          title="Você já depositou o seu voto!"
          description="O sistema garante a regra de 1 eleitor = 1 voto. O seu voto anônimo foi computado e aguarda a apuração final."
          action={
            <div className="flex gap-3">
              <Link href="/validar">
                <Button variant="outline">Validar Meu Código</Button>
              </Link>
              <Link href="/como-funciona">
                <Button>Entenda o Método IRV</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cabine de Votação"
        description="Selecione a sua chapa preferida para registrar seu voto único. O Voto por Ranking transfere o seu voto de forma inteligente caso sua primeira opção seja eliminada."
      />

      <VotePanel chapas={chapas} candidates={candidates} />
    </div>
  );
}
