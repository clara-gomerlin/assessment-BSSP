import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = () => process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = "gabriel@growthleaders.academy";
const FROM_NAME = "Gabriel Costa | GLA";

interface DiagnosticEmailData {
  recipientName: string;
  recipientEmail: string;
  scoreGeral: number;
  scoreGeralLabel: string;
  dimensions: {
    name: string;
    emoji: string;
    normalizedScore: number;
    statusLabel: string;
    statusColor: string;
  }[];
  strongest: { name: string; emoji: string; normalizedScore: number };
  weakest: { name: string; emoji: string; normalizedScore: number };
  analysis?: {
    diagnostico?: string;
    sinais?: string;
    acao?: string;
    acao_passos?: string[];
  };
  quizTitle: string;
  ctaUrl?: string;
}

function getScoreColor(score: number): string {
  if (score >= 71) return "#1dbf73";
  if (score >= 51) return "#f5a623";
  if (score >= 31) return "#e87c3e";
  return "#e84343";
}

function getDimStatusLabel(score: number): string {
  if (score >= 71) return "Alavanca Ativa";
  if (score >= 41) return "Em Desenvolvimento";
  return "Ponto Cego";
}

function getDimStatusColor(score: number): string {
  if (score >= 71) return "#1dbf73";
  if (score >= 41) return "#f5a623";
  return "#e84343";
}

function buildDiagnosticEmailHtml(data: DiagnosticEmailData): string {
  const scoreColor = getScoreColor(data.scoreGeral);
  const firstName = data.recipientName.split(" ")[0];

  const dimensionRows = data.dimensions
    .map((dim) => {
      const statusLabel = getDimStatusLabel(dim.normalizedScore);
      const statusColor = getDimStatusColor(dim.normalizedScore);
      const barWidth = Math.max(dim.normalizedScore, 5);
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size: 15px; color: #161616; font-family: 'DM Sans', Arial, sans-serif; padding-bottom: 6px;">
                  ${dim.emoji} ${dim.name}
                  <span style="float: right; font-weight: 700; color: ${statusColor};">${dim.normalizedScore}/100</span>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background: #f0f0f0; border-radius: 4px; height: 8px;">
                        <div style="background: ${statusColor}; width: ${barWidth}%; height: 8px; border-radius: 4px;"></div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 4px;">
                  <span style="display: inline-block; font-size: 11px; font-weight: 600; color: ${statusColor}; background: ${statusColor}15; padding: 2px 8px; border-radius: 10px;">
                    ${statusLabel}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  const actionSteps = data.analysis?.acao_passos
    ? data.analysis.acao_passos
        .map(
          (step, i) => `
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #374151; font-family: 'DM Sans', Arial, sans-serif; line-height: 1.5;">
            <span style="display: inline-block; width: 24px; height: 24px; background: #0f172a; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 8px;">${i + 1}</span>
            ${step}
          </td>
        </tr>`
        )
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Resultado — ${data.quizTitle}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f7fa; font-family: 'DM Sans', Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f5f7fa; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background: #ffffff; padding: 32px 40px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <img src="https://assessment.growthleaders.academy/logos/gla-logo.png" alt="GLA" width="140" style="display: inline-block; max-width: 140px;">
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 16px;">
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0f172a; font-family: Georgia, 'Times New Roman', serif;">
                ${firstName}, aqui está seu resultado
              </h1>
              <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.5;">
                Resultado completo do ${data.quizTitle}
              </p>
            </td>
          </tr>

          <!-- Score Hero -->
          <tr>
            <td style="padding: 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <div style="font-size: 56px; font-weight: 800; color: ${scoreColor}; font-family: Georgia, 'Times New Roman', serif; line-height: 1;">
                      ${data.scoreGeral}
                    </div>
                    <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">/100</div>
                    <div style="display: inline-block; margin-top: 12px; padding: 6px 16px; border-radius: 20px; background: ${scoreColor}15; color: ${scoreColor}; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      ${data.scoreGeralLabel}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Strongest / Weakest -->
          <tr>
            <td style="padding: 8px 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="background: #f0fdf4; border-radius: 10px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Alavanca Mais Forte</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">
                      ${data.strongest.emoji} ${data.strongest.name}
                    </div>
                    <div style="font-size: 13px; color: #16a34a; font-weight: 600; margin-top: 4px;">${data.strongest.normalizedScore}/100</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background: #fef2f2; border-radius: 10px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Alavanca Mais Fraca</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">
                      ${data.weakest.emoji} ${data.weakest.name}
                    </div>
                    <div style="font-size: 13px; color: #dc2626; font-weight: 600; margin-top: 4px;">${data.weakest.normalizedScore}/100</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dimensions Breakdown -->
          <tr>
            <td style="padding: 16px 40px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0f172a; font-family: Georgia, 'Times New Roman', serif;">
                Suas 4 Alavancas de Receita
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${dimensionRows}
              </table>
            </td>
          </tr>

          <!-- AI Analysis -->
          ${
            data.analysis?.diagnostico
              ? `
          <tr>
            <td style="padding: 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Diagnóstico</div>
                    <div style="font-size: 14px; color: #374151; line-height: 1.6; font-family: 'DM Sans', Arial, sans-serif;">
                      ${data.analysis.diagnostico}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          ${
            data.analysis?.sinais
              ? `
          <tr>
            <td style="padding: 8px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Sinais de Alerta</div>
                    <div style="font-size: 14px; color: #374151; line-height: 1.6; font-family: 'DM Sans', Arial, sans-serif;">
                      ${data.analysis.sinais}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Action Steps -->
          ${
            actionSteps
              ? `
          <tr>
            <td style="padding: 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0fdf4; border-radius: 12px; border-left: 4px solid #22c55e;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Próximos Passos</div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${actionSteps}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${data.ctaUrl || "https://wa.me/5511999999999"}" style="display: inline-block; padding: 16px 40px; background: #0f172a; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                      Quero acelerar meu crescimento
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                Growth Leaders Academy<br>
                Este email foi enviado porque você completou o ${data.quizTitle}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDiagnosticResultEmail(data: DiagnosticEmailData): Promise<boolean> {
  try {
    sgMail.setApiKey(SENDGRID_API_KEY());

    const html = buildDiagnosticEmailHtml(data);

    await sgMail.send({
      to: data.recipientEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `${data.recipientName.split(" ")[0]}, seu resultado do ${data.quizTitle} está pronto`,
      html,
    });

    return true;
  } catch (err) {
    console.error("SendGrid email error:", err);
    return false;
  }
}
