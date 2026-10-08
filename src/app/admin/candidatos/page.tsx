import { PageHeader } from "@/components/page-header";
import { getCandidates, getChapas } from "@/lib/election/queries";
import { CandidateManager } from "./candidate-form";

export const metadata = {
  title: "Gerenciar Candidatos — Painel Admin",
};

export default async function CandidatesPage() {
  const [candidates, chapas] = await Promise.all([getCandidates(), getChapas()]);

  const chapasExist = chapas.length > 0;
  const maxReached = candidates.length >= 5;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de Candidatos"
        description="Gerencie os concorrentes da eleição (até 5). Quando as chapas forem geradas, os candidatos serão congelados para garantir a consistência das urnas."
      />

      <CandidateManager
        candidates={candidates}
        chapasExist={chapasExist}
        maxReached={maxReached}
      />
    </div>
  );
}
