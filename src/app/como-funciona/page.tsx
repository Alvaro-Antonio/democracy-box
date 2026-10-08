import Link from "next/link";
import {
  Vote,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  ArrowDownRight,
  Trophy,
  Users,
  Repeat,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ResultsSummary } from "@/components/results-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getElectionResults } from "@/lib/election/results";

export const metadata = {
  title: "Como Funciona o Voto por Ranking — Democracy Box",
  description:
    "Aprenda o funcionamento do Voto por Ranking (Instant-Runoff Voting), suas vantagens, desvantagens e a matemática da eliminação com exemplos ilustrados.",
};

export default async function HowItWorksPage() {
  const data = await getElectionResults();
  const hasClosedResults = data.status === "closed" && data.irv && data.candidates;

  return (
    <div className="space-y-16 pb-16">
      <PageHeader
        title="Como Funciona o Voto por Ranking?"
        description="O Voto por Ranking (Ranked Choice Voting / Instant-Runoff Voting) é um sistema eleitoral transparente que permite aos eleitores ordenar candidatos por preferência em vez de escolher apenas um."
      />

      {/* Se a eleição já estiver encerrada, exibe o resumo aqui */}
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

      {/* SEÇÃO 1: OS 3 PASSOS COM ILUSTRAÇÕES DE CARTÕES E DIAGRAMAS */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">O Fluxo do Voto em 3 Passos</h2>
          <p className="text-sm text-muted-foreground">
            Entenda como sua cédula trabalha por você caso sua primeira opção não vença.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passo 1 */}
          <Card className="border-border/60 bg-card/60 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                <Vote className="size-5" />
              </div>
              <CardTitle className="text-base font-bold">1. O Eleitor Ordena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você ranqueia seus favoritos: 1ª, 2ª, 3ª escolha... Sem medo de desperdiçar seu voto no candidato do coração.
              </p>
              
              {/* Ilustração Passo 1: Mini Cédula Ordenada */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-background/80 shadow-inner space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Layers className="size-3 text-primary" /> Exemplo de Cédula
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-primary/10 border border-primary/30 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">1º</span>
                      Candidata Ana
                    </span>
                    <span className="text-[10px] text-primary font-bold">Favorita</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border/40">
                    <span className="flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-muted text-foreground text-[10px] flex items-center justify-center font-semibold">2º</span>
                      Candidato Bruno
                    </span>
                    <span className="text-[10px] text-muted-foreground">Alternativa</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/20 border border-border/30 opacity-70">
                    <span className="flex items-center gap-1.5">
                      <span className="size-4 rounded-full bg-muted text-muted-foreground text-[10px] flex items-center justify-center font-semibold">3º</span>
                      Candidata Carla
                    </span>
                    <span className="text-[10px] text-muted-foreground">3ª opção</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 2 */}
          <Card className="border-border/60 bg-card/60 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                <TrendingUp className="size-5" />
              </div>
              <CardTitle className="text-base font-bold">2. Contagem da 1ª Rodada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contam-se os votos de 1ª preferência. Se alguém conquistar mais de 50% dos votos ativos, vence imediatamente!
              </p>

              {/* Ilustração Passo 2: Barra de Meta de 50% */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-background/80 shadow-inner space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground font-semibold">
                  <span>Placar Rodada 1</span>
                  <span className="text-amber-400 font-bold">Meta: &gt; 50%</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Ana</span>
                      <span>40%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Bruno</span>
                      <span>35%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-rose-400">
                      <span>Carla (Último)</span>
                      <span>25%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 3 */}
          <Card className="border-border/60 bg-card/60 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                <Sparkles className="size-5" />
              </div>
              <CardTitle className="text-base font-bold">3. Transferência Instantânea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ninguém teve 50%? Carla é eliminada e cada um dos seus votos migra para a 2ª opção indicada naquela cédula.
              </p>

              {/* Ilustração Passo 3: Transferência e Vencedor */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-inner space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Repeat className="size-3" /> Rodada 2: Bruno Vence
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Ana</span>
                      <span>40% + 5% = 45%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex justify-between text-[11px] mb-1 font-bold text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Trophy className="size-3 text-amber-400" /> Bruno Eleito!
                      </span>
                      <span>35% + 20% = 55%</span>
                    </div>
                    <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: "55%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEÇÃO 2: INFOGRÁFICO VISUAL COMPARATIVO DO SEGUNDO TURNO INSTANTÂNEO */}
      <section className="rounded-3xl border border-border/70 bg-gradient-to-b from-card/80 to-card/40 p-6 sm:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-3">
            <Sparkles className="size-3.5" /> Infográfico Didático
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Como uma eleição é apurada na prática?
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Veja a simulação de uma eleição com 100 eleitores disputada entre Ana, Bruno e Carla:
          </p>
        </div>

        {/* Diagrama de Rodadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Rodada 1 Visual */}
          <div className="p-6 rounded-2xl border border-border/80 bg-background/60 space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Rodada 1 (Contagem Inicial)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted">100 Cédulas Ativas</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" /> Ana (1ª Opção)
                </span>
                <span className="font-mono font-bold">40 votos (40%)</span>
              </div>
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "40%" }} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold flex items-center gap-2">
                  <span className="size-3 rounded-full bg-emerald-500" /> Bruno (1ª Opção)
                </span>
                <span className="font-mono font-bold">35 votos (35%)</span>
              </div>
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "35%" }} />
              </div>

              <div className="flex items-center justify-between text-sm text-rose-400">
                <span className="font-semibold flex items-center gap-2">
                  <span className="size-3 rounded-full bg-rose-500" /> Carla (1ª Opção)
                </span>
                <span className="font-mono font-bold">25 votos (25%)</span>
              </div>
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: "25%" }} />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-start gap-2">
              <ArrowDownRight className="size-4 shrink-0 mt-0.5" />
              <span>
                <strong>Ninguém atingiu 51 votos (&gt; 50%).</strong> Carla teve a menor votação e é eliminada. Seus 25 eleitores não são ignorados: olhamos a 2ª opção indicada em cada uma de suas cédulas.
              </span>
            </div>
          </div>

          {/* Rodada 2 Visual com Transferência */}
          <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.04] space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Trophy className="size-3.5 text-amber-400" /> Rodada 2 (Após Redistribuição)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Maioria Formada!
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-background/80 border border-border/60 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Destino das 25 cédulas de Carla:</span>
                <div className="flex justify-between mt-1 text-xs font-mono">
                  <span>+ 5 votos apontavam Ana como 2ª</span>
                  <span className="font-bold text-emerald-400">+ 20 votos apontavam Bruno como 2ª</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-muted-foreground">Ana</span>
                  <span className="font-mono text-muted-foreground">40 + 5 = 45 votos (45%)</span>
                </div>
                <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Trophy className="size-4 text-amber-400" /> Bruno (Vencedor)
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400">35 + 20 = 55 votos (55%)</span>
                </div>
                <div className="h-4 w-full bg-muted/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 font-mono text-[10px] text-slate-950 font-bold flex items-center justify-center" style={{ width: "55%" }}>
                    55%
                  </div>
                </div>
                <p className="text-[11px] text-emerald-300/90 leading-tight">
                  Bruno superou a meta de 50% e foi eleito por ter a maior preferência combinada e menor rejeição!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: COMPARAÇÃO COM VOTO TRADICIONAL */}
      <section className="rounded-3xl border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Diferenças para o Voto Tradicional (Maioria Simples)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-rose-400 flex items-center gap-2 text-base">
              <XCircle className="size-5" />
              Voto Tradicional (&quot;First-Past-The-Post&quot;)
            </h3>
            <ul className="space-y-2.5 text-muted-foreground list-disc pl-5 leading-relaxed">
              <li>Candidatos com 25% a 30% dos votos podem vencer se a oposição for fragmentada.</li>
              <li>Gera o efeito &quot;spoiler&quot; ou candidato divisionista, que rouba votos de aliados.</li>
              <li>Estimula o voto estratégico por medo, em vez da expressão sincera do eleitor.</li>
              <li>Exige segundo turno presencial caro semanas depois.</li>
            </ul>
          </div>

          <div className="space-y-4 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-base">
              <CheckCircle2 className="size-5" />
              Voto por Ranking (Instant-Runoff)
            </h3>
            <ul className="space-y-2.5 text-muted-foreground list-disc pl-5 leading-relaxed">
              <li>Garante que o eleito tem amplo apoio de mais de 50% da população ativa.</li>
              <li>Você pode votar no seu candidato de coração em 1º sem medo de eleger o pior.</li>
              <li>Incentiva campanhas propositivas: candidatos disputam as 2ªs opções uns dos outros.</li>
              <li>Realiza o segundo turno instantaneamente numa única ida às urnas.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: VANTAGENS E DESAFIOS */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Vantagens e Desafios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3 p-5 rounded-2xl border border-border/60 bg-card/60">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="size-4" /> Principais Vantagens
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Consenso maior entre eleitores, redução da polarização tóxica, maior representatividade
              para novos partidos e eliminação de custos milionários com múltiplos turnos de votação.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl border border-border/60 bg-card/60">
            <h3 className="font-semibold text-amber-400 flex items-center gap-2">
              <Users className="size-4" /> Desafios e Considerações
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Cédulas e interfaces precisam ser didáticas para não confundir o eleitor; a apuração
              exige computação centralizada das permutações para fazer as rodadas de eliminação
              corretamente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <div className="text-center pt-4">
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
