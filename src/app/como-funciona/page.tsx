import Link from "next/link";
import {
  Vote,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ResultsSummary } from "@/components/results-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getElectionResults } from "@/lib/election/results";

export const metadata = {
  title: "Como Funciona o Voto por Ranking — Democracy Box",
  description:
    "Aprenda o funcionamento do Voto por Ranking (Instant-Runoff Voting), suas vantagens, desvantagens e a matemática da eliminação.",
};

export default async function HowItWorksPage() {
  const data = await getElectionResults();
  const hasClosedResults = data.status === "closed" && data.irv && data.candidates;

  return (
    <div className="space-y-12 pb-12">
      <PageHeader
        title="Como Funciona o Voto por Ranking?"
        description="O Voto por Ranking (Ranked Choice Voting / Instant-Runoff Voting) é um sistema eleitoral que permite aos eleitores ordenar candidatos por preferência em vez de escolher apenas um."
      />

      {/* Se a eleição já estiver encerrada, exibe o resumo aqui também como pedido na spec */}
      {hasClosedResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-amber-400" />
              Resultado Final da Eleição Atual
            </h2>
            <Link href="/resultado">
              <Button variant="outline" size="sm">
                Ver Apuração Detalhada
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </Link>
          </div>
          <ResultsSummary irv={data.irv!} candidates={data.candidates!} />
        </div>
      )}

      {/* Explicação Didática */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <Vote className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">1. O Eleitor Ordena</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Em vez de ficar limitado ao dilema do &quot;voto útil&quot;, você ranqueia: 1ª opção, 2ª opção, 3ª
            opção... Você vota no seu candidato ideal sem medo de desperdiçar seu voto.
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <TrendingUp className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">2. Contagem da 1ª Rodada</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Inicialmente, contam-se apenas os votos de 1ª preferência. Se alguém atingir mais de 50%
            (maioria absoluta), é declarado vencedor imediatamente na 1ª rodada.
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <Sparkles className="size-5" />
            </div>
            <CardTitle className="text-base font-bold">3. Segundo Turno Instantâneo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Se ninguém alcançar 50%, o último colocado é eliminado. As cédulas dele são
            redistribuídas para a 2ª opção indicada por cada um daqueles eleitores. Repete-se até
            haver maioria!
          </CardContent>
        </Card>
      </div>

      {/* Comparação: Tradicional vs RCV */}
      <div className="rounded-3xl border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Diferenças para o Voto Tradicional (Maioria Simples)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="size-4" />
              Voto Tradicional (&quot;First-Past-The-Post&quot;)
            </h3>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Candidatos com 25% a 30% dos votos podem vencer se a oposição for dividida.</li>
              <li>Gera o efeito &quot;spoiler&quot; ou candidato divisionista, que rouba votos de aliados.</li>
              <li>Estimula o voto estratégico por medo, em vez da expressão sincera do eleitor.</li>
              <li>Exige segundo turno presencial caro semanas depois.</li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Voto por Ranking (Instant-Runoff)
            </h3>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Garante que o eleito tem amplo apoio de mais de 50% da população ativa.</li>
              <li>Você pode votar no seu candidato de coração em 1º sem medo de eleger o pior.</li>
              <li>Incentiva campanhas propositivas: candidatos disputam as 2ªs opções uns dos outros.</li>
              <li>Realiza o segundo turno instantaneamente numa única ida às urnas.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vantagens e Desvantagens */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Vantagens e Desafios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-400">Principais Vantagens</h3>
            <p className="text-muted-foreground leading-relaxed">
              Consenso maior entre eleitores, redução da polarização tóxica, maior representatividade
              para novos partidos e eliminação de custos milionários com múltiplos turnos de votação.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-amber-400">Desafios e Considerações</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cédulas e interfaces precisam ser didáticas para não confundir o eleitor; a apuração
              exige computação centralizada das permutações para fazer as rodadas de eliminação
              corretamente.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link href="/votar">
          <Button size="lg" className="font-bold shadow-lg">
            Experimentar na Prática na Cabine de Voto
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
