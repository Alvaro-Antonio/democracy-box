"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ShieldCheck, MailCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface VoteCodeDisplayProps {
  code: string;
  chapaNumber: number;
  emailSentTo?: string | null;
}

export function VoteCodeDisplay({ code, chapaNumber, emailSentTo }: VoteCodeDisplayProps) {
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
    <div className="p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/40 bg-card/80 backdrop-blur-md shadow-2xl max-w-xl mx-auto text-center space-y-6">
      <div className="size-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
        <ShieldCheck className="size-9" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-foreground">Voto Registrado com Sucesso!</h2>
        <p className="text-sm text-muted-foreground">
          Você votou na Chapa <strong>#{String(chapaNumber).padStart(2, "0")}</strong>. Guarde o seu
          comprovante para auditar a contabilização do seu voto de forma 100% anônima.
        </p>
      </div>

      {/* Caixa do Código da Cédula */}
      <div className="p-4 rounded-xl bg-background border-2 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Código da sua Cédula:
          </span>
          <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-emerald-400 select-all">
            {code}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 w-full sm:w-auto font-semibold">
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
          {copied ? "Copiado!" : "Copiar Código"}
        </Button>
      </div>

      {/* Confirmação de Envio por E-mail */}
      {emailSentTo ? (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-left flex items-start gap-3">
          <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <MailCheck className="size-4" />
          </div>
          <div className="text-xs text-sky-200/90 leading-relaxed">
            <strong className="text-sky-100 block font-semibold">Comprovante enviado por e-mail!</strong>
            Enviamos uma cópia deste código e os detalhes para o seu endereço{" "}
            <span className="font-mono text-sky-300 font-bold underline">{emailSentTo}</span>.
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground text-left flex items-center gap-2">
          <MailCheck className="size-4 text-muted-foreground shrink-0" />
          <span>Comprovante gerado. Guarde ou copie o código acima para auditar sua cédula.</span>
        </div>
      )}

      {/* Ações adicionais */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href={`/validar?code=${encodeURIComponent(code)}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="size-4" />
            Testar Validação Pública Agora
          </Button>
        </Link>
        <Link href="/como-funciona" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full">
            Entenda a Apuração (IRV)
          </Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
        <strong>Privacidade garantida:</strong> este código está associado à chapa que você escolheu,
        mas o seu e-mail e dados pessoais <u>não</u> estão armazenados junto com a sua cédula na urna.
      </p>
    </div>
  );
}
