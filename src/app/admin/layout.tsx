import Link from "next/link";
import { Users, Layers, LayoutDashboard } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border/50 pb-3">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
        >
          <LayoutDashboard className="size-4" />
          Visão Geral
        </Link>
        <Link
          href="/admin/candidatos"
          className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
        >
          <Users className="size-4" />
          Candidatos
        </Link>
        <Link
          href="/admin/chapas"
          className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
        >
          <Layers className="size-4" />
          Chapas Geradas
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}
