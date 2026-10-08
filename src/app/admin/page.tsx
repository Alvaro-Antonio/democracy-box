import Link from "next/link";
import { Users, Layers, Vote, ArrowRight } from "lucide-react";

import { ElectionStatusBadge } from "@/components/election-status-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCandidates, getChapas, getElectionSettings } from "@/lib/election/queries";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ElectionControls } from "./election-controls";

export const metadata = {
  title: "Painel de Administração — Democracy Box",
};

export default async function AdminDashboardPage() {
  const [candidates, chapas, settings] = await Promise.all([
    getCandidates(),
    getChapas(),
    getElectionSettings(),
  ]);

  const adminSupabase = createAdminSupabase();
  const { count: voteCount } = await adminSupabase
    .from("votes")
    .select("*", { count: "exact", head: true });

  const totalVotes = voteCount || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel de Controle Eleitoral"
        description="Gerencie candidatos, gere as combinações de chapas e controle a abertura/encerramento do pleito."
      >
        <ElectionStatusBadge status={settings.status} />
      </PageHeader>

      <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ações de Controle da Urna</h2>
            <p className="text-xs text-muted-foreground">
              Passos: 1. Cadastrar Candidatos → 2. Gerar Chapas → 3. Abrir Votação → 4. Encerrar
            </p>
          </div>
          <ElectionControls
            settings={settings}
            candidateCount={candidates.length}
            chapasCount={chapas.length}
            voteCount={totalVotes}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Candidatos</CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold">{candidates.length} / 5</div>
            <p className="text-xs text-muted-foreground">
              {candidates.length === 0
                ? "Nenhum candidato registrado."
                : `${candidates.length} candidatos concorrendo.`}
            </p>
            <Link href="/admin/candidatos" className="block pt-2">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Gerenciar Candidatos
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chapas Geradas</CardTitle>
            <Layers className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold">{chapas.length}</div>
            <p className="text-xs text-muted-foreground">
              {chapas.length === 0
                ? "Chapas ainda não geradas."
                : "Todas as permutações ordenadas prontas."}
            </p>
            <Link href="/admin/chapas" className="block pt-2">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Visualizar Chapas
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Votos Registrados</CardTitle>
            <Vote className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold">{totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              {settings.status === "closed"
                ? "Apuração finalizada."
                : settings.status === "open"
                ? "Eleição recebendo votos em tempo real."
                : "Aguardando abertura."}
            </p>
            {settings.status === "closed" && (
              <Link href="/resultado" className="block pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-between text-primary">
                  Ver Relatório da Apuração
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
