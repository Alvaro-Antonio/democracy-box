import { PageHeader } from "@/components/page-header";
import { ValidateForm } from "./validate-form";

export const metadata = {
  title: "Validar Voto — Democracy Box",
  description: "Consulte a autenticidade de um código de voto de forma transparente e anônima.",
};

export default function ValidatePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Auditoria Pública do Voto"
        description="Qualquer pessoa ou eleitor pode consultar se uma cédula foi computada na urna sem revelar a identidade de quem votou."
      />

      <ValidateForm />
    </div>
  );
}
