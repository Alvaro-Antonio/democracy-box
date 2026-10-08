"use client";

import { useState } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface VoteCodeDisplayProps {
  code: string;
  chapaNumber: number;
}

export function VoteCodeDisplay({ code, chapaNumber }: VoteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código de verificação copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-primary/40 bg-card/70 backdrop-blur-md shadow-2xl max-w-xl mx-auto text-center space-y-6">
      <div className="size-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
        <ShieldCheck className="size-9" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Voto Registrado com Sucesso!</h2>
        <p className="text-sm text-muted-foreground">
          Você votou na Chapa <strong>#{String(chapaNumber).padStart(2, "0")}</strong>. Guarde o seu
          comprovante para auditar a contabilização do seu voto de forma 100% anônima.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-background border border-border/80 flex items-center justify-between gap-4">
        <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-primary select-all">
          {code}
        </span>
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong>Privacidade garantida:</strong> este código está associado à chapa que você escolheu,
        mas o seu e-mail e dados pessoais <u>não</u> estão armazenados junto com a sua cédula.
      </p>
    </div>
  );
}
