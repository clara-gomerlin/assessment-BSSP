"use client";

import { useCallback, useState } from "react";
import { IPRTDimensionResult } from "@/lib/types";

interface IPRTAnalysis {
  type: "analysis";
  analise_personalizada: string;
  recomendacoes: string[];
  modulos_recomendados: string[];
  mensagem_urgencia: string;
}

interface IPRTResultViewProps {
  result: {
    type: "meta";
    iprtScore: number;
    stage: string;
    stageColor: string;
    dimensions: IPRTDimensionResult[];
    weakestDimension: IPRTDimensionResult;
    qualification: {
      perfil: string;
      perfilCode: string;
      numClientes: string;
      formacao: string;
      formacaoCode: string;
    };
    leadScore: number;
    leadCategory: string;
    errosNormativos: number;
    totalNormativos: number;
    aguardandoPreparacao: boolean;
    acoesRealizadas: number;
  };
  analysis: IPRTAnalysis | null;
  markdown: string;
  respondentName: string;
  quizSlug: string;
  quizId?: string;
  responseId?: string | null;
  respondentEmail?: string;
  ctaWhatsappUrl?: string;
  hubspotContactId?: string | null;
  quizTitle?: string;
  utmParams?: Record<string, string>;
}

// --- Stage copy ---
const STAGE_COPY: Record<string, string> = {
  Observador:
    "Seu conhecimento sobre a Reforma Tributária ainda é superficial e há lacunas significativas em múltiplas áreas. Você está analisando o novo modelo com a lente do sistema atual — e isso coloca em risco a qualidade da sua orientação a clientes e sua relevância profissional nos próximos anos. A boa notícia: você identificou isso agora, enquanto ainda há tempo de se preparar.",
  "Em Alerta":
    "Você tem uma base, mas seu diagnóstico revela gaps críticos que precisam de atenção. Você sabe que a Reforma é importante, mas ainda há distância entre o que sabe e o que precisa saber para atuar com segurança. O mercado está se movendo — profissionais que fecharem esses gaps primeiro vão capturar as melhores oportunidades.",
  "Em Construção":
    "Você demonstra bom domínio dos fundamentos, mas ainda precisa consolidar a aplicação prática e acelerar a preparação operacional. Você está no caminho certo — mas entre 'saber a teoria' e 'atuar com excelência' há uma distância que separa profissionais bons de especialistas que lideram.",
  "Pronto para Liderar":
    "Parabéns — você está entre os poucos profissionais que demonstram alto nível de preparo para a Reforma Tributária. Você domina os fundamentos, sabe aplicar na prática, está se preparando operacionalmente e enxerga as oportunidades. Continue investindo para se posicionar como referência no novo cenário tributário.",
};

// --- Gap tension copy ---
const GAP_COPY: Record<string, (acertos: number) => string> = {
  DN: (acertos) =>
    `Você tem lacunas técnicas que podem gerar erros na orientação a clientes. Das perguntas técnicas, você acertou ${acertos} de 4. A Reforma traz conceitos estruturalmente diferentes do modelo atual — e essas diferenças impactam diretamente quem depende da sua orientação profissional.`,
  AP: () =>
    "Você conhece as regras, mas na hora de traduzir para a realidade do cliente — precificação, contratos, sistemas — ainda há gaps importantes. Saber a lei e saber usar a lei são coisas diferentes. E seu cliente vai cobrar a segunda.",
  PO: (acoesRealizadas) =>
    `Você tem conhecimento, mas ainda não começou a agir de fato. Das 6 ações de preparação, você realizou apenas ${acoesRealizadas}. Cada mês sem ação concreta é margem, oportunidade e posicionamento que se perdem. A Reforma não espera.`,
  VE: () =>
    "Você está focado nos riscos e na complexidade — e está perdendo de vista que a Reforma Tributária é a maior oportunidade da década para profissionais tributários. Quem se posicionar como especialista primeiro vai capturar o mercado premium de consultoria de transição.",
};

// --- Profile insight copy ---
const PROFILE_COPY: Record<string, string> = {
  contador:
    "Contadores tendem a focar em apuração e deixar de lado o impacto contratual e estratégico. Seu resultado reflete esse padrão — e é exatamente onde seus clientes mais vão precisar de orientação nos próximos anos.",
  advogado:
    "Advogados tributaristas costumam dominar o aspecto constitucional, mas subestimam o impacto operacional e tecnológico. Seu diagnóstico aponta para esse gap — e o mercado vai cobrar visão integrada, não apenas parecer jurídico.",
  administrador:
    "Gestores frequentemente subestimam o impacto da reforma no fluxo de caixa e na formação de preço. Seu resultado mostra que esse é justamente o ponto que exige atenção imediata para proteger a saúde financeira da operação.",
};

// --- Badge helpers ---
function getDimBadge(pct: number): { label: string; bg: string; color: string; border: string } {
  if (pct <= 30) return { label: "Crítico", bg: "rgba(239,68,68,0.06)", color: "#dc2626", border: "rgba(239,68,68,0.15)" };
  if (pct <= 55) return { label: "Atenção", bg: "rgba(255,165,0,0.08)", color: "#C47F17", border: "rgba(255,165,0,0.2)" };
  if (pct <= 80) return { label: "Em Construção", bg: "rgba(14,165,233,0.08)", color: "#0ea5e9", border: "rgba(14,165,233,0.2)" };
  return { label: "Forte", bg: "rgba(34,197,94,0.08)", color: "#16a34a", border: "rgba(34,197,94,0.2)" };
}

function getBarColor(pct: number): string {
  if (pct <= 30) return "#dc2626";
  if (pct <= 55) return "#f59e0b";
  if (pct <= 80) return "#0ea5e9";
  return "#16a34a";
}

// --- Donut Chart ---
function DonutChart({ score, color }: { score: number; color: string }) {
  const size = 160;
  const stroke = 10;
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: size, height: size }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 48, color: "#E8E8E3", lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "rgba(232,232,227,0.4)" }}>de 100</div>
      </div>
    </div>
  );
}

export default function IPRTResultView({
  result,
  analysis,
  markdown,
  respondentName,
  respondentEmail,
  quizId,
  responseId,
  ctaWhatsappUrl,
  hubspotContactId,
  quizTitle,
}: IPRTResultViewProps) {
  const firstName = respondentName.split(" ")[0] || "Profissional";
  const [dealCreated, setDealCreated] = useState(false);

  const dimSummary = result.dimensions
    .map((d) => `${d.emoji} ${d.name}: ${d.percentage}%`)
    .join("\n");
  const whatsappMessage = encodeURIComponent(
    `Fiz o IPRT e quero saber mais sobre a especialização.\n\n` +
    `*Meu resultado:*\n` +
    `Índice: ${result.iprtScore}% — ${result.stage}\n\n` +
    `${dimSummary}\n\n` +
    `Maior lacuna: ${result.weakestDimension.emoji} ${result.weakestDimension.name} (${result.weakestDimension.percentage}%)\n` +
    `Perfil: ${result.qualification.perfil}`
  );
  const whatsappUrl = ctaWhatsappUrl ? `${ctaWhatsappUrl}?text=${whatsappMessage}` : "#";

  const handleCtaClick = useCallback(() => {
    if (dealCreated || !hubspotContactId) return;
    setDealCreated(true);
    fetch("/api/quiz/create-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hubspot_contact_id: hubspotContactId,
        contact_name: respondentName,
        contact_email: respondentEmail,
        quiz_title: quizTitle || "Quiz",
        quiz_id: quizId,
        response_id: responseId,
      }),
    }).catch((err) => console.error("Deal creation error:", err));
  }, [hubspotContactId, respondentName, respondentEmail, quizTitle, quizId, responseId, dealCreated]);

  const stageCopy = STAGE_COPY[result.stage] || "";
  const weakestCode = result.weakestDimension.code;
  const gapFn = GAP_COPY[weakestCode];
  const gapCopy = gapFn
    ? weakestCode === "DN" ? gapFn(result.totalNormativos - result.errosNormativos)
    : weakestCode === "PO" ? gapFn(result.acoesRealizadas)
    : gapFn(0) : "";

  let profileInsight = "";
  const perfCode = result.qualification.perfilCode.toLowerCase();
  if (perfCode.includes("contab")) profileInsight = PROFILE_COPY.contador;
  else if (perfCode.includes("advoc")) profileInsight = PROFILE_COPY.advogado;
  else if (perfCode.includes("admin") || perfCode.includes("gest")) profileInsight = PROFILE_COPY.administrador;

  const showNeutralizerTempo = result.aguardandoPreparacao || result.dimensions.find(d => d.code === "DN")?.percentage === 0;
  const showNeutralizerAutodidata = result.errosNormativos >= 3 &&
    (result.qualification.formacaoCode.includes("noticias") || result.qualification.formacaoCode.includes("webinars"));

  const sortedDims = [...result.dimensions].sort((a, b) => b.percentage - a.percentage);
  const strongestDim = sortedDims[0];

  // Accent: BSSP blue
  const accent = "#0ea5e9";

  return (
    <div style={{ fontFamily: "'Montserrat', system-ui, sans-serif", color: "#1A1A1A", background: "#F8F8F5" }}>
      {/* ====== NAVBAR ====== */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 64px", background: "#031D31", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <img src="/logos/bssp-pos-graduacao-white.png" alt="BSSP Pós-Graduação" style={{ height: 36 }} />
      </nav>

      {/* ====== HERO: Score ====== */}
      <section style={{ background: "#031D31", padding: "48px 64px 64px", textAlign: "center", color: "#E8E8E3" }}>
        <p style={{ fontSize: 18, color: "#E8E8E3", marginBottom: 8 }}>
          <strong>{firstName}</strong>, aqui está o seu <span style={{ fontWeight: 700 }}>IPRT.</span>
        </p>
        <h1 style={{ fontWeight: 700, fontSize: "clamp(18px, 2vw, 24px)", color: "#E8E8E3", marginBottom: 32, lineHeight: 1.3 }}>
          Índice de Prontidão para a Reforma Tributária<span style={{ color: accent }}>.</span>
        </h1>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeSlideUp 0.6s ease-out 0.1s both" }}>
          <DonutChart score={result.iprtScore} color={result.stageColor} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${result.stageColor}18`, border: `1px solid ${result.stageColor}40`, color: result.stageColor, fontWeight: 600, fontSize: 15, padding: "8px 20px", borderRadius: 100 }}>
            {result.stage}
          </div>

          <p style={{ fontSize: 15, color: "rgba(232,232,227,0.55)", maxWidth: 500, lineHeight: 1.6 }}>
            {stageCopy.split(".")[0]}.
          </p>
        </div>
      </section>

      {/* ====== 2-COLUMN LAYOUT ====== */}
      <div className="iprt-content-wrapper" style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

        {/* LEFT: Content cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Breakdown por Dimensão */}
          <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)" }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(168,168,160,0.2)" }}>
              Breakdown por Dimensão
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {result.dimensions.map((dim) => {
                const badge = getDimBadge(dim.percentage);
                const barColor = getBarColor(dim.percentage);
                return (
                  <div key={dim.code} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }}>
                        <span style={{ fontSize: 15 }}>{dim.emoji}</span>
                        {dim.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="iprt-dim-badge" style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{dim.percentage}%</span>
                      </div>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "rgba(168,168,160,0.12)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 100, width: `${dim.percentage}%`, background: barColor, transition: "width 1s ease-out" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strongest / Weakest */}
            <div className="iprt-highlight-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={{ padding: 14, borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#16a34a", marginBottom: 6 }}>Mais forte</p>
                <p style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, margin: 0 }}>{strongestDim.emoji} {strongestDim.name}</p>
                <p style={{ fontSize: 13, color: "#555550", marginTop: 2 }}>{strongestDim.percentage}%</p>
              </div>
              <div style={{ padding: 14, borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#dc2626", marginBottom: 6 }}>Maior lacuna</p>
                <p style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, margin: 0 }}>{result.weakestDimension.emoji} {result.weakestDimension.name}</p>
                <p style={{ fontSize: 13, color: "#555550", marginTop: 2 }}>{result.weakestDimension.percentage}%</p>
              </div>
            </div>
          </div>

          {/* Mobile CTA (hidden on desktop) */}
          <div className="iprt-mobile-cta-card" style={{ display: "none" }}>
            <div style={{ background: "#031D31", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <span style={{ fontSize: 28 }}>🎓</span>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "#E8E8E3", lineHeight: 1.4 }}>Fechar essas lacunas é a diferença entre assistir e liderar.</h3>
              <p style={{ fontSize: 13, color: "rgba(232,232,227,0.55)", lineHeight: 1.6 }}>
                A Especialização BSSP prepara você para atuar com segurança no novo cenário tributário.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: accent, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "none", width: "100%", letterSpacing: 0.3 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.337 0-4.542-.67-6.413-1.822l-.387-.243-2.882.966.966-2.882-.243-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> FALAR COM ESPECIALISTA
              </a>
            </div>
          </div>

          {/* Sua Maior Lacuna */}
          {gapCopy && (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", borderLeft: "4px solid #dc2626" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🔴</span>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Sua maior lacuna</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, lineHeight: 1.3 }}>
                {result.weakestDimension.emoji} {result.weakestDimension.name} — {result.weakestDimension.percentage}%
              </h3>
              <p style={{ fontSize: 15, color: "#555550", lineHeight: 1.75 }}>{gapCopy}</p>
            </div>
          )}

          {/* Profile Insight */}
          {profileInsight && (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", borderLeft: `4px solid ${accent}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>👤</span>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Insight do seu perfil</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, lineHeight: 1.3 }}>
                {result.qualification.perfil}
              </h3>
              <p style={{ fontSize: 15, color: "#555550", lineHeight: 1.75 }}>{profileInsight}</p>
            </div>
          )}

          {/* Neutralizers */}
          {showNeutralizerTempo && (
            <div style={{ background: "#FFFCF7", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>⏰</span>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Mito: &quot;Ainda tem tempo&quot;</span>
              </div>
              <p style={{ fontSize: 15, color: "#555550", lineHeight: 1.75 }}>
                A transição já começou em 2026. Impactos em contratos, sistemas e precificação são reais AGORA. Profissionais que esperam vão competir com quem já se preparou.
              </p>
            </div>
          )}

          {showNeutralizerAutodidata && (
            <div style={{ background: "#FFFCF7", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>📚</span>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Mito: &quot;Dá pra aprender sozinho&quot;</span>
              </div>
              <p style={{ fontSize: 15, color: "#555550", lineHeight: 1.75 }}>
                Das {result.totalNormativos} perguntas técnicas, você acertou{" "}
                {result.totalNormativos - result.errosNormativos}. A complexidade da Reforma vai
                muito além de acompanhar notícias — são novos conceitos, novas lógicas de crédito,
                novos impactos operacionais que exigem formação estruturada.
              </p>
            </div>
          )}

          {/* AI Analysis */}
          {analysis ? (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", borderLeft: "4px solid #16a34a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Análise personalizada</span>
              </div>
              <p style={{ fontSize: 15, color: "#555550", lineHeight: 1.75, marginBottom: 16 }}>{analysis.analise_personalizada}</p>

              {analysis.recomendacoes?.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Recomendações:</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: "0 0 16px" }}>
                    {analysis.recomendacoes.map((r, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#555550", lineHeight: 1.65 }}>
                        <span style={{ color: "#8A8A82", flexShrink: 0 }}>•</span>{r}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {analysis.modulos_recomendados?.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Módulos recomendados:</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: "0 0 16px" }}>
                    {analysis.modulos_recomendados.map((m, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#555550", lineHeight: 1.65 }}>
                        <span style={{ color: "#8A8A82", flexShrink: 0 }}>•</span>{m}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {analysis.mensagem_urgencia && (
                <p style={{ marginTop: 16, fontSize: 14, color: "#555550", lineHeight: 1.65 }}>
                  <strong style={{ fontWeight: 600, color: "#1A1A1A" }}>⚡ {analysis.mensagem_urgencia}</strong>
                </p>
              )}
            </div>
          ) : markdown ? (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)" }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 15, color: "#555550", lineHeight: 1.75 }}>{markdown}</div>
              <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246" }}>▊</span>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 32px", border: "1px solid rgba(168,168,160,0.2)", textAlign: "center" }}>
              <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246", fontSize: 16 }}>
                Gerando análise personalizada...
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Sticky CTA Sidebar */}
        <div className="iprt-cta-sidebar" style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#031D31", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#E8E8E3", lineHeight: 1.4 }}>
              Fechar essas lacunas é a diferença entre assistir e liderar.
            </h3>
            <p style={{ fontSize: 13, color: "rgba(232,232,227,0.55)", lineHeight: 1.6 }}>
              A Especialização BSSP prepara você para atuar com segurança no novo cenário tributário.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: accent, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "none", width: "100%", letterSpacing: 0.3, transition: "all 0.3s ease" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.337 0-4.542-.67-6.413-1.822l-.387-.243-2.882.966.966-2.882-.243-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> FALAR COM ESPECIALISTA
            </a>
          </div>
        </div>
      </div>

      {/* ====== BOTTOM CTA ====== */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ background: "#031D31", borderRadius: 16, padding: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="iprt-bottom-cta-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(18px, 2vw, 22px)", color: "#E8E8E3", lineHeight: 1.35 }}>
              Identificar lacunas é o primeiro passo. Fechá-las é o que define quem lidera.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(232,232,227,0.6)", lineHeight: 1.7 }}>
              A Especialização em Reforma Tributária da BSSP cobre todas as 4 dimensões do IPRT com profundidade — do normativo ao estratégico.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 }}>
              {[
                "12 módulos cobrindo IBS, CBS, Split Payment, Simples Nacional e mais",
                "Aplicação prática: contratos, preços, sistemas, compliance",
                "Certificação que posiciona você como especialista no mercado",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(232,232,227,0.75)", lineHeight: 1.6 }}>
                  <span style={{ color: "#38bdf8", flexShrink: 0 }}>✦</span>{item}
                </li>
              ))}
            </ul>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: accent, color: "white", fontWeight: 700, fontSize: 15, padding: "16px 36px", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "none", width: "fit-content", letterSpacing: 0.3, transition: "all 0.3s ease" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.337 0-4.542-.67-6.413-1.822l-.387-.243-2.882.966.966-2.882-.243-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> FALAR COM ESPECIALISTA
            </a>
          </div>

          {/* Testimonial */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            <p style={{ fontWeight: 500, fontSize: 16, color: "rgba(232,232,227,0.85)", lineHeight: 1.65, fontStyle: "italic", paddingLeft: 20, borderLeft: `3px solid ${accent}` }}>
              &ldquo;Desde o primeiro contato com a BSSP eu senti que fiz a escolha certa. Mas após o primeiro módulo eu pude ter certeza que estava no caminho certo.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img
                src="/testimonials/bssp/jacqueline-duarte.webp"
                alt="Jacqueline Duarte"
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }}
              />
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#E8E8E3", display: "block" }}>Jacqueline Duarte</span>
                <span style={{ fontSize: 13, color: "rgba(232,232,227,0.45)", lineHeight: 1.4 }}>Aluna BSSP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA — mobile only */}
      <div className="iprt-sticky-cta">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="result-primary-cta" onClick={handleCtaClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.337 0-4.542-.67-6.413-1.822l-.387-.243-2.882.966.966-2.882-.243-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          FALAR COM ESPECIALISTA
        </a>
      </div>

      <style>{`
        /* Desktop: hide bottom sticky bar (sidebar handles CTA) */
        .iprt-sticky-cta { display: none; }

        @media (max-width: 768px) {
          .iprt-content-wrapper {
            grid-template-columns: 1fr !important;
            padding: 32px 16px !important;
            gap: 24px !important;
          }
          .iprt-cta-sidebar { display: none !important; }
          .iprt-mobile-cta-card { display: block !important; }
          .iprt-dim-badge { display: none !important; }
          .iprt-bottom-cta-inner {
            grid-template-columns: 1fr !important;
            padding: 32px 24px !important;
            gap: 32px !important;
          }
          /* Mobile: show fixed bottom sticky bar */
          .iprt-sticky-cta {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            padding: 12px 20px;
            padding-bottom: max(12px, env(safe-area-inset-bottom));
            background: linear-gradient(0deg, #F8F8F5 70%, transparent);
            pointer-events: none;
          }
          .iprt-sticky-cta .result-primary-cta {
            display: block;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            text-align: center;
            pointer-events: auto;
          }
        }
        @media (max-width: 480px) {
          .iprt-highlight-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
