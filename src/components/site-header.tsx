import Link from "next/link";
import { Vote, Shield, BarChart3, CheckSquare, HelpCircle } from "lucide-react";

import { adminEmails } from "@/lib/env.server";
import { getCurrentUser } from "@/lib/auth/admin";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const allowed = adminEmails();
  const isAdmin = user ? isAdminEmail(user.email, allowed) : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Vote className="size-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-foreground text-base">Democracy Box</span>
            <span className="block text-[10px] text-muted-foreground -mt-1 tracking-wider uppercase">Ranked Choice Voting</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/como-funciona" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <HelpCircle className="size-4" />
            Como Funciona
          </Link>
          <Link href="/validar" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <CheckSquare className="size-4" />
            Validar Voto
          </Link>
          <Link href="/resultado" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BarChart3 className="size-4" />
            Resultados
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold">
              <Shield className="size-4" />
              Painel Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/votar">
            <Button size="sm" className="font-semibold shadow-sm">
              <Vote className="size-4 mr-1.5" />
              Votar Agora
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline max-w-[140px] truncate">
                {user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
