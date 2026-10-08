"use client";

import { useState, useTransition } from "react";
import { Search, CheckCircle2, XCircle, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { type ValidationResult, validateVoteCode } from "@/app/actions/validate";
import { CandidateAvatar } from "@/components/candidate-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatChapaNumber } from "@/lib/ranked/vote-code";

export function ValidateForm() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) return;

    startTransition(async () => {
      const res = await validateVoteCode(code);
      if (res.ok) {
        setResult(res.data);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold">Auditar e Validar Cédula</CardTitle>
          <CardDescription>
            Insira o seu código para confirmar que a cédula foi registrada no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Ex: VR-ABCD-EFGH-JKLM"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-center sm:text-left text-base uppercase tracking-wider"
                required
                disabled={isPending}
              />
              <Button type="submit" disabled={isPending} className="font-semibold shrink-0">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Search className="size-4 mr-2" />
                )}
                Verificar
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              Formatos aceitos: VR-XXXX-XXXX-XXXX, minúsculas, com ou sem hífens.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Resultados com aria-live para acessibilidade */}
      <div aria-live="polite" className="transition-all">
        {result && !result.valid && (
          <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-center space-y-2">
            <div className="size-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="size-6" />
            </div>
            <h3 className="font-semibold text-rose-300">Código Não Encontrado</h3>
            <p className="text-xs text-rose-300/80 max-w-md mx-auto">
              Nenhuma cédula corresponde a este código. Verifique se digitou todos os caracteres
              corretamente.
            </p>
          </div>
        )}

        {result && result.valid && (
          <Card className="border-emerald-500/30 bg-card/80 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                <CheckCircle2 className="size-4" />
                Cédula Autêntica e Válida
              </div>
              <CardTitle className="text-lg">
                Chapa #{formatChapaNumber(result.chapaNumber)}
              </CardTitle>
              <CardDescription>
                Abaixo está a ordem de preferências registrada para esta cédula.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                {result.candidates.map((cand, idx) => (
                  <div
                    key={cand.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <span className="font-mono text-xs font-bold size-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                      {idx + 1}º
                    </span>
                    <CandidateAvatar candidate={cand} size="md" />
                    <div>
                      <p className="font-semibold text-sm">{cand.name}</p>
                      {cand.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {cand.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
                <p>
                  <strong>Garantia de Anonimato:</strong> Este resultado atesta que a urna recebeu
                  sua cédula intacta, mas não revela nem armazena quem você é.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
