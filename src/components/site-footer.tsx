import Link from "next/link";
import { Vote, Code2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/60 py-8 text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Vote className="size-4 text-primary" />
          <span className="font-semibold text-foreground">Democracy Box</span>
          <span>— Sistema Demonstrativo de Voto por Ranking (IRV)</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/como-funciona" className="hover:text-foreground transition-colors">
            Como Funciona
          </Link>
          <Link href="/validar" className="hover:text-foreground transition-colors">
            Auditoria / Validação
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Code2 className="size-4" />
            Código Aberto
          </a>
        </div>
      </div>
    </footer>
  );
}
