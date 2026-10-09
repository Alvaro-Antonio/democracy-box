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

      {/* SEÇÃO NOVA: APROFUNDAMENTO DA DISTRIBUIÇÃO E TRANSFERÊNCIA DOS VOTOS */}
      <section className="rounded-3xl border-2 border-primary/30 bg-card/70 p-6 sm:p-10 space-y-10 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Repeat className="size-3.5" /> Mecânica Central do IRV
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Como Funciona a Distribuição dos Votos em Detalhes?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A distribuição (ou transferência) dos votos é o coração do <em>Instant-Runoff Voting</em>. 
            Em vez de tratar o seu voto como uma única escolha descartável, a urna eletrônica interpreta a sua 
            cédula como um <strong>conjunto de instruções condicionais</strong>: <em>&quot;Meu voto é de X. Mas se X não tiver chances reais de vitória, por favor, transfira meu apoio para Y.&quot;</em>
          </p>
        </div>

        {/* 4 Princípios da Distribuição */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-border/80 bg-background/80 space-y-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-foreground">Uma Cédula = Exatamente 1 Voto</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Nenhum eleitor tem dois votos ao mesmo tempo. Em qualquer rodada de apuração, a sua cédula 
              está depositada em <strong>apenas um único candidato ativo</strong>. A distribuição apenas move 
              o mesmo e único voto de lugar quando seu titular cai.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-background/80 space-y-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-foreground">Apenas as Cédulas do Eliminado se Movem</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Se você votou em um candidato que continua firme na disputa, <strong>seu voto não se move</strong>. 
              Sua segunda e terceira opções permanecem guardadas na reserva e só serão lidas se o seu favorito 
              vier a ser eliminado em rodadas posteriores.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-background/80 space-y-2.5">
            <div className="size-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-mono font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-foreground">Distribuição Individualizada</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Quando um candidato é eliminado, seus votos <strong>não vão em bloco para o mesmo competidor</strong>. 
              Cada cédula individual é analisada separadamente: quem marcou Bruno em 2º vai para Bruno; 
              quem marcou Ana em 2º vai para Ana.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-background/80 space-y-2.5">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-base text-foreground">Cédulas Esgotadas (Exhausted)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Se você ranquear poucos candidatos e todos eles forem eliminados em rodadas sucessivas, 
              sua cédula fica <em>&quot;esgotada&quot;</em>. Ela não vota contra ninguém e a meta de 50% 
              é recalculada sobre as cédulas que ainda continuam ativas.
            </p>
          </div>
        </div>

        {/* Exemplos Práticos Passo a Passo com Cédulas Reais */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Exemplos Práticos: O Que Acontece Com a Sua Cédula?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acompanhe o caminho percorrido pelo voto de 3 eleitores diferentes durante uma eleição disputada:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Caso A: Eleitor do Candidato Eliminado */}
            <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Cenário A: Migração Imediata</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20">Voto transferido</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-background/80 border border-rose-500/30 flex items-center justify-between">
                  <span>1º Carla (Menos votada)</span>
                  <span className="text-[10px] font-bold text-rose-400">Eliminada ❌</span>
                </div>
                <div className="flex justify-center text-emerald-400 font-bold text-xs py-0.5">
                  ↓ Cédula é aberta: transfere para a 2ª opção
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 font-semibold text-emerald-300 flex items-center justify-between">
                  <span>2º Bruno (Ativo)</span>
                  <span className="text-[10px] font-bold text-emerald-400">+1 Voto para Bruno ✅</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                O voto não foi perdido! O eleitor ajudou Carla enquanto ela disputou e, quando ela caiu, 
                seu voto fortaleceu diretamente a sua segunda opção.
              </p>
            </div>

            {/* Caso B: Eleitor de um Candidato que segue Vivo */}
            <div className="p-4 rounded-2xl border border-primary/40 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span>Cenário B: Estabilidade</span>
                <span className="px-2 py-0.5 rounded bg-primary/20">Voto intacto</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-background/80 border border-primary/40 flex items-center justify-between font-semibold">
                  <span>1º Ana (Continua na disputa)</span>
                  <span className="text-[10px] font-bold text-primary">Permanece com Ana ✅</span>
                </div>
                <div className="flex justify-center text-muted-foreground text-xs py-0.5">
                  — 2ª opção fica guardada na reserva
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground flex items-center justify-between">
                  <span>2º Bruno</span>
                  <span className="text-[10px]">Não acionada</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Como Ana não foi eliminada, a cédula nunca abre a 2ª opção. O voto permanece 100% creditado para Ana.
              </p>
            </div>

            {/* Caso C: Eliminações em Cadeia */}
            <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Cenário C: Salto Sucessivo</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20">Cascata</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-background/80 border border-border/40 flex items-center justify-between line-through text-muted-foreground">
                  <span>1º Daniel</span>
                  <span className="text-[10px] text-rose-400 font-bold">Caiu na R1 ❌</span>
                </div>
                <div className="p-2 rounded-lg bg-background/80 border border-border/40 flex items-center justify-between line-through text-muted-foreground">
                  <span>2º Carla</span>
                  <span className="text-[10px] text-rose-400 font-bold">Caiu na R2 ❌</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/40 font-semibold text-amber-300 flex items-center justify-between">
                  <span>3º Bruno</span>
                  <span className="text-[10px] font-bold text-amber-400">+1 Voto na R3 ✅</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mesmo após duas eliminações consecutivas, a cédula continuou viva e pulou para a 3ª preferência!
              </p>
            </div>
          </div>
        </div>

        {/* Perguntas Frequentes sobre a Distribuição */}
        <div className="border-t border-border/60 pt-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Perguntas Frequentes sobre a Distribuição</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
              <strong className="text-foreground block font-semibold">
                O candidato que ficou em 1º na primeira rodada sempre vence?
              </strong>
              <p className="leading-relaxed">
                Não necessariamente. Se o primeiro colocado for rejeitado pela maioria dos demais eleitores, 
                um candidato de consenso em 2º lugar pode receber a maior parte das transferências e virar a disputa 
                legitimamente, porque agrada a mais pessoas no somatório geral.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
              <strong className="text-foreground block font-semibold">
                Indicar uma 2ª opção pode prejudicar a minha 1ª opção?
              </strong>
              <p className="leading-relaxed">
                <strong>Nunca.</strong> A matemática do Voto por Ranking garante que a sua 2ª opção jamais 
                competirá com a sua 1ª opção. A 2ª escolha só é olhada se a sua 1ª já estiver matematicamente eliminada.
              </p>
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
