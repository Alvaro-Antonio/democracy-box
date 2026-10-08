import Link from "next/link";
import {
  Vote,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

import { ElectionStatusBadge } from "@/components/election-status-badge";
import { Button } from "@/components/ui/button";
import { getElectionSettings } from "@/lib/election/queries";

export default async function HomePage() {
  const settings = await getElectionSettings();

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          Democracia Transparente &amp; Aberta
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight">
          O Futuro das Eleições com{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-amber-400">
            Voto por Ranking
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Chega de "voto útil" ou candidatos divisionistas. Ordene seus candidatos favoritos de 1 a
          5, receba um código criptográfico de validação e acompanhe as rodadas do segundo turno
          instantâneo (IRV).
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/votar" className="w-full sm:w-auto">
            <Button size="lg" className="w-full font-bold shadow-xl">
              <Vote className="size-5 mr-2" />
              Entrar na Cabine de Votação
            </Button>
          </Link>

          <Link href="/como-funciona" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full font-semibold">
              <HelpCircle className="size-5 mr-2" />
              Como Funciona o IRV
            </Button>
          </Link>
        </div>

        <div className="pt-2 flex justify-center">
          <ElectionStatusBadge status={settings.status} />
        </div>
      </section>

      {/* Como funciona o fluxo do sistema */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary">
            01
          </div>
          <h3 className="font-bold text-base">Candidatos &amp; Chapas</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Até 5 candidatos cadastrados. O sistema gera automaticamente todas as permutações
            hierárquicas numeradas em chapas oficiais.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary">
            02
          </div>
          <h3 className="font-bold text-base">Voto do Eleitor</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Autenticado por e-mail ou Magic Link, o eleitor escolhe sua chapa com a ordem completa
            de preferências. Apenas 1 voto por cidadão.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary">
            03
          </div>
          <h3 className="font-bold text-base">Auditoria Anônima</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Um código no formato <code>VR-XXXX-XXXX-XXXX</code> comprova que a cédula está na urna
            sem expor a identidade de quem votou.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary">
            04
          </div>
          <h3 className="font-bold text-base">Apuração Instant-Runoff</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eliminações sucessivas do último colocado com transferência automática de votos até
            atingir mais de 50% de apoio popular.
          </p>
        </div>
      </section>

      {/* Chamada para Ação */}
      <section className="p-8 sm:p-12 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/80 to-primary/5 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Pronto para experimentar a democracia do ranking?
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Participe agora mesmo da demonstração, audite o seu comprovante e confira como a apuração
          acontece de forma limpa e transparente.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/votar">
            <Button size="lg" className="font-bold">
              Depositar Meu Voto
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
          <Link href="/validar">
            <Button variant="outline" size="lg">
              <ShieldCheck className="size-4 mr-2" />
              Validar um Código
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
