import "server-only";

export interface SendVoteReceiptParams {
  to: string;
  code: string;
  chapaNumber: number;
}

export interface SendVoteReceiptResult {
  sent: boolean;
  provider: "resend" | "dev_logger" | "none";
  error?: string;
}

/**
 * Envia o comprovante da cédula eleitoral para o e-mail do eleitor.
 *
 * Utiliza a API REST do Resend se RESEND_API_KEY estiver configurada.
 * Caso contrário, emite log estruturado no servidor (modo desenvolvimento),
 * garantindo que a experiência local não seja interrompida.
 */
export async function sendVoteReceiptEmail({
  to,
  code,
  chapaNumber,
}: SendVoteReceiptParams): Promise<SendVoteReceiptResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim() || "Democracy Box <onboarding@resend.dev>";
  const formattedChapa = String(chapaNumber).padStart(2, "0");
  const validationUrl = `${siteUrl}/validar?code=${encodeURIComponent(code)}`;

  const subject = `[Democracy Box] Comprovante da sua Cédula de Voto — ${code}`;

  const textContent = `
Democracy Box — Comprovante de Cédula de Voto

Olá! O seu voto foi registrado com sucesso na urna eletrônica.

Detalhes da sua Cédula:
• Chapa Escolhida: #${formattedChapa}
• Código Único de Auditoria: ${code}

Você pode auditar a existência da sua cédula a qualquer momento em:
${validationUrl}

Privacidade e Sigilo:
O sistema garante o método Instant-Runoff Voting (IRV). O seu código comprova que sua cédula foi incluída na urna sem expor a sua identidade pública aos demais participantes.
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; padding: 8px 16px; border-radius: 9999px; background-color: #0284c720; border: 1px solid #0284c740; color: #38bdf8; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                Democracy Box • Urna Eletrônica
              </div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 16px 0 8px 0;">
                Comprovante de Votação
              </h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                O seu voto foi computado com sucesso pelo método de Voto por Ranking.
              </p>
            </td>
          </tr>

          <!-- Chapa Selecionada -->
          <tr>
            <td style="padding: 16px 0;">
              <table width="100%" style="background-color: #1e293b60; border-radius: 12px; border: 1px solid #334155; padding: 16px;">
                <tr>
                  <td>
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600;">Chapa Votada:</span>
                    <div style="color: #38bdf8; font-size: 18px; font-weight: bold; margin-top: 4px;">
                      Chapa #${formattedChapa}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Código da Cédula -->
          <tr>
            <td style="padding: 16px 0;">
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 8px;">
                Código Único da Cédula (Guarde este código):
              </span>
              <div style="background-color: #020617; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #34d399;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>

          <!-- Botão de Validação Pública -->
          <tr>
            <td align="center" style="padding: 24px 0 16px 0;">
              <a href="${validationUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                Auditar Meu Voto Publicamente
              </a>
            </td>
          </tr>

          <!-- Rodapé / Privacidade -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.6; text-align: center;">
              <strong>Privacidade e Sigilo Garantidos:</strong> O seu código comprova que sua cédula de preferência está na urna para a apuração por Instant-Runoff Voting (IRV). O seu endereço de e-mail jamais é vinculado publicamente à sua escolha.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // Se não houver chave de API configurada, simula o envio com log de desenvolvimento
  if (!apiKey) {
    console.info(
      `[Email Dev] Comprovante de voto gerado com sucesso para ${to}.\n` +
      `Código: ${code} | Chapa: #${formattedChapa}\n` +
      `Para disparar e-mails reais em produção, configure RESEND_API_KEY no .env.local.`,
    );
    return { sent: true, provider: "dev_logger" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Email Service] Erro ao enviar comprovante para ${to}: ${errorText}`);
      return { sent: false, provider: "resend", error: errorText };
    }

    console.info(`[Email Service] Comprovante de voto enviado via Resend para ${to}.`);
    return { sent: true, provider: "resend" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`[Email Service] Falha na requisição de e-mail para ${to}:`, message);
    return { sent: false, provider: "resend", error: message };
  }
}
