import { ChapaList } from "@/components/chapa-list";
import { PageHeader } from "@/components/page-header";
import { getCandidates, getChapas } from "@/lib/election/queries";

export const metadata = {
  title: "Chapas Geradas — Painel Admin",
};

export default async function AdminChapasPage() {
  const [candidates, chapas] = await Promise.all([getCandidates(), getChapas()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chapas Eleitorais Geradas"
        description="Cada chapa representa uma permutação ordenada de 1 a 5 candidatos. O eleitor escolhe uma chapa completa ao registrar o seu voto."
      />

      <ChapaList chapas={chapas} candidates={candidates} />
    </div>
  );
}
