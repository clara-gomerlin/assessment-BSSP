"use client";

import { useRef, useCallback, useState } from "react";
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

// --- Dimension Bar ---
function DimensionBar({
  dim,
  animDelay,
}: {
  dim: IPRTDimensionResult;
  animDelay: number;
}) {
  const barColor =
    dim.percentage <= 30
      ? "#e84343"
      : dim.percentage <= 55
      ? "#f5a623"
      : dim.percentage <= 80
      ? "#0ea5e9"
      : "#1dbf73";

  return (
    <div
      style={{
        opacity: 0,
        animation: "fadeUp 0.5s ease forwards",
        animationDelay: `${animDelay}s`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{dim.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#031D31" }}>
            {dim.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            peso {Math.round(dim.weight * 100)}%
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: barColor,
              minWidth: 40,
              textAlign: "right",
            }}
          >
            {dim.percentage}%
          </span>
        </div>
      </div>
      <div className="diagnostic-bar-track">
        <div
          className="diagnostic-bar-fill"
          style={{
            width: `${dim.percentage}%`,
            background: barColor,
            animationDelay: `${animDelay + 0.3}s`,
          }}
        />
      </div>
    </div>
  );
}

// --- Donut Chart (dark variant for hero) ---
function DonutChart({
  score,
  stage,
  color,
  dark = false,
}: {
  score: number;
  stage: string;
  color: string;
  dark?: boolean;
}) {
  const size = dark ? 200 : 180;
  const stroke = dark ? 16 : 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: dark ? 48 : 36, fontWeight: 700, color: dark ? "#ffffff" : "#031D31", lineHeight: 1 }}>
          {score}%
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", marginTop: 4 }}>
          IPRT
        </span>
      </div>
    </div>
  );
}

// --- Brag Tag Generator ---
function useBragTag() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(
    async (
      name: string,
      score: number,
      stage: string,
      stageColor: string,
      strongest: IPRTDimensionResult,
      weakest: IPRTDimensionResult,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      // Background
      ctx.fillStyle = "#031D31";
      ctx.fillRect(0, 0, W, H);

      // Accent bar at top
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#1a7ec2");
      grad.addColorStop(1, "#0ea5e9");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 6);

      // Title
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ÍNDICE DE PRONTIDÃO PARA A REFORMA TRIBUTÁRIA", W / 2, 80);

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 42px sans-serif";
      ctx.fillText(name, W / 2, 140);

      // Score circle
      const cx = W / 2;
      const cy = 360;
      const r = 130;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#1e3a50";
      ctx.lineWidth = 16;
      ctx.stroke();

      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (score / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = stageColor;
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.stroke();

      // Score text
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 72px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${score}`, cx, cy + 16);
      ctx.font = "400 24px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("de 100", cx, cy + 50);

      // Stage label
      ctx.fillStyle = stageColor;
      ctx.font = "700 28px sans-serif";
      ctx.fillText(stage, cx, cy + r + 60);

      // Strongest dimension
      const dimY = 610;
      ctx.textAlign = "left";
      const leftX = 100;

      ctx.fillStyle = "#1dbf73";
      ctx.font = "700 18px sans-serif";
      ctx.fillText("DIMENSÃO MAIS FORTE", leftX, dimY);
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 26px sans-serif";
      ctx.fillText(`${strongest.emoji} ${strongest.name}`, leftX, dimY + 38);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 20px sans-serif";
      ctx.fillText(`Score: ${strongest.percentage}/100`, leftX, dimY + 70);

      // Weakest dimension
      const dimY2 = dimY + 120;
      ctx.fillStyle = "#e84343";
      ctx.font = "700 18px sans-serif";
      ctx.fillText("DIMENSÃO MAIS FRACA", leftX, dimY2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 26px sans-serif";
      ctx.fillText(`${weakest.emoji} ${weakest.name}`, leftX, dimY2 + 38);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 20px sans-serif";
      ctx.fillText(`Score: ${weakest.percentage}/100`, leftX, dimY2 + 70);

      // Footer
      ctx.textAlign = "center";
      ctx.fillStyle = "#64748b";
      ctx.font = "500 20px sans-serif";
      ctx.fillText("BSSP Pós-Graduação", cx, H - 40);

    },
    []
  );

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `iprt-resultado.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return { canvasRef, generate, download };
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
  const { canvasRef, generate, download } = useBragTag();
  const [dealCreated, setDealCreated] = useState(false);

  // WhatsApp URL with pre-filled message including score and weakest dimension
  const whatsappMessage = encodeURIComponent(
    `Olá! Fiz o diagnóstico IPRT e gostaria de saber mais sobre a Especialização em Reforma Tributária.\n\n` +
    `Meu índice: ${result.iprtScore}% (${result.stage})\n` +
    `Maior lacuna: ${result.weakestDimension.name} (${result.weakestDimension.percentage}%)\n` +
    `Perfil: ${result.qualification.perfil}`
  );
  const whatsappUrl = ctaWhatsappUrl
    ? `${ctaWhatsappUrl}?text=${whatsappMessage}`
    : "#";

  // Share: prominent when score > 55%
  const showProminentShare = result.iprtScore > 55;

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

  // Gap tension for weakest dimension
  const gapFn = GAP_COPY[weakestCode];
  const gapCopy = gapFn
    ? weakestCode === "DN"
      ? gapFn(result.totalNormativos - result.errosNormativos)
      : weakestCode === "PO"
      ? gapFn(result.acoesRealizadas)
      : gapFn(0)
    : "";

  // Profile insight
  let profileInsight = "";
  const perfCode = result.qualification.perfilCode.toLowerCase();
  if (perfCode.includes("contab")) profileInsight = PROFILE_COPY.contador;
  else if (perfCode.includes("advoc")) profileInsight = PROFILE_COPY.advogado;
  else if (perfCode.includes("admin") || perfCode.includes("gest"))
    profileInsight = PROFILE_COPY.administrador;

  // Neutralizers
  const showNeutralizerTempo =
    result.aguardandoPreparacao || result.dimensions.find(d => d.code === "DN")?.percentage === 0;
  const showNeutralizerAutodidata =
    result.errosNormativos >= 3 &&
    (result.qualification.formacaoCode.includes("noticias") ||
      result.qualification.formacaoCode.includes("webinars"));

  // Find strongest dimension
  const sortedDims = [...result.dimensions].sort((a, b) => b.percentage - a.percentage);
  const strongestDimension = sortedDims[0];

  return (
    <div style={{ width: "100%" }}>
      {/* ============ DARK HERO SECTION ============ */}
      <div style={{ background: "#031D31", padding: "0 0 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", padding: "24px 0 20px", opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.1s both" }}>
            <img
              src="/logos/bssp-pos-graduacao-white.png"
              alt="BSSP Pós-Graduação"
              style={{ display: "inline-block", height: 40 }}
            />
          </div>

          {/* Greeting */}
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.6)", margin: "0 0 4px", opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.15s both" }}>
            {firstName}, seu Índice de Prontidão:
          </p>

          {/* IPRT title */}
          <h1 style={{ textAlign: "center", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(36px, 6vw, 48px)", color: "#ffffff", lineHeight: 1.1, margin: "0 0 24px", letterSpacing: -0.5, opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.2s both" }}>
            IPRT<span style={{ color: "#0ea5e9" }}>.</span>
          </h1>

          {/* Donut chart on dark */}
          <div style={{ opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.3s both" }}>
            <DonutChart score={result.iprtScore} stage={result.stage} color={result.stageColor} dark />
          </div>

          {/* Stage badge */}
          <div style={{ textAlign: "center", marginTop: 16, opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.4s both" }}>
            <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, fontSize: 15, fontWeight: 700, color: result.stageColor, background: `${result.stageColor}20`, border: `1px solid ${result.stageColor}40` }}>
              {result.stage}
            </span>
          </div>

          {/* Brief description */}
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.6)", maxWidth: 440, margin: "16px auto 0", opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.5s both" }}>
            Índice de Prontidão para a Reforma Tributária
          </p>
        </div>
      </div>

      {/* ============ LIGHT BODY SECTION ============ */}
      <div style={{ background: "#f8fafc", padding: "0 0 90px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>

          {/* Breakdown card with dimension bars */}
          <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px 20px", marginTop: -24, boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)", opacity: 0, animation: "fadeUp 0.6s ease forwards", animationDelay: "0.6s" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#031D31", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 20 }}>
              Breakdown por Dimensão
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {result.dimensions.map((dim, i) => (
                <DimensionBar key={dim.code} dim={dim} animDelay={0.8 + i * 0.15} />
              ))}
            </div>
          </div>

          {/* Strongest / Weakest highlight cards */}
          <div className="iprt-highlight-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            {/* Strongest */}
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 14, padding: "16px 14px", opacity: 0, animation: "fadeUp 0.5s ease forwards", animationDelay: "1.4s" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 6, letterSpacing: 0.3 }}>MAIS FORTE</p>
              <p style={{ fontSize: 20, margin: "0 0 4px" }}>{strongestDimension.emoji}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 2px", lineHeight: 1.3 }}>{strongestDimension.name}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#16a34a", margin: 0 }}>{strongestDimension.percentage}%</p>
            </div>
            {/* Weakest */}
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "16px 14px", opacity: 0, animation: "fadeUp 0.5s ease forwards", animationDelay: "1.5s" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 6, letterSpacing: 0.3 }}>MAIOR LACUNA</p>
              <p style={{ fontSize: 20, margin: "0 0 4px" }}>{result.weakestDimension.emoji}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 2px", lineHeight: 1.3 }}>{result.weakestDimension.name}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", margin: 0 }}>{result.weakestDimension.percentage}%</p>
            </div>
          </div>

          {/* Stage description */}
          <div style={{ marginTop: 20, opacity: 0, animation: "fadeUp 0.5s ease forwards", animationDelay: "1.7s" }}>
            <div className="diag-card" style={{ background: `${result.stageColor}10`, border: `1px solid ${result.stageColor}40`, borderLeft: `4px solid ${result.stageColor}`, opacity: 1, animation: "none" }}>
              <div className="diag-card__header">
                <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: result.stageColor, background: `${result.stageColor}20` }}>
                  {result.stage.toUpperCase()}
                </span>
              </div>
              <p className="diag-card__text">{stageCopy}</p>
            </div>
          </div>

          {/* Gap Tension */}
          {gapCopy && (
            <div style={{ marginTop: 16 }}>
              <div className="diag-card diag-card--red">
                <div className="diag-card__header">
                  <span style={{ fontSize: 18 }}>🔴</span>
                  <span className="diag-card__title">SUA MAIOR LACUNA</span>
                </div>
                <p className="diag-card__subtitle">
                  {result.weakestDimension.emoji} {result.weakestDimension.name}
                </p>
                <p className="diag-card__text">{gapCopy}</p>
              </div>
            </div>
          )}

          {/* Profile insight */}
          {profileInsight && (
            <div style={{ marginTop: 16 }}>
              <div className="diag-card diag-card--blue">
                <div className="diag-card__header">
                  <span style={{ fontSize: 18 }}>👤</span>
                  <span className="diag-card__title">INSIGHT DO SEU PERFIL</span>
                </div>
                <p className="diag-card__subtitle">{result.qualification.perfil}</p>
                <p className="diag-card__text">{profileInsight}</p>
              </div>
            </div>
          )}

          {/* Neutralizers */}
          {showNeutralizerTempo && (
            <div style={{ marginTop: 16 }}>
              <div className="diag-card diag-card--amber">
                <div className="diag-card__header">
                  <span style={{ fontSize: 18 }}>⏰</span>
                  <span className="diag-card__title">MITO: &quot;AINDA TEM TEMPO&quot;</span>
                </div>
                <p className="diag-card__text">
                  A transição já começou em 2026. Impactos em contratos, sistemas e precificação são reais AGORA. Profissionais que esperam vão competir com quem já se preparou.
                </p>
              </div>
            </div>
          )}

          {showNeutralizerAutodidata && (
            <div style={{ marginTop: 16 }}>
              <div className="diag-card diag-card--amber">
                <div className="diag-card__header">
                  <span style={{ fontSize: 18 }}>📚</span>
                  <span className="diag-card__title">MITO: &quot;DÁ PRA APRENDER SOZINHO&quot;</span>
                </div>
                <p className="diag-card__text">
                  Das {result.totalNormativos} perguntas técnicas, você acertou{" "}
                  {result.totalNormativos - result.errosNormativos}. A complexidade da Reforma vai
                  muito além de acompanhar notícias — são novos conceitos, novas lógicas de crédito,
                  novos impactos operacionais que exigem formação estruturada.
                </p>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div style={{ marginTop: 24 }}>
            {analysis ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="diag-card diag-card--green">
                  <div className="diag-card__header">
                    <span style={{ fontSize: 18 }}>🎯</span>
                    <span className="diag-card__title">ANÁLISE PERSONALIZADA</span>
                  </div>
                  <p className="diag-card__text">{analysis.analise_personalizada}</p>

                  {analysis.recomendacoes?.length > 0 && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 14, marginBottom: 6 }}>
                        Recomendações:
                      </p>
                      <ul className="diag-card__list">
                        {analysis.recomendacoes.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {analysis.modulos_recomendados?.length > 0 && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 14, marginBottom: 6 }}>
                        Módulos da Especialização mais relevantes para você:
                      </p>
                      <ul className="diag-card__list">
                        {analysis.modulos_recomendados.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {analysis.mensagem_urgencia && (
                    <p className="diag-card__impact">
                      ⚡ {analysis.mensagem_urgencia}
                    </p>
                  )}
                </div>
              </div>
            ) : markdown ? (
              <div className="prose-result">
                <div style={{ whiteSpace: "pre-wrap" }}>{markdown}</div>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246" }}>
                  ▊
                </span>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246", fontSize: 18 }}>
                  Gerando análise personalizada...
                </span>
              </div>
            )}
          </div>

          {/* CTA inline */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", textAlign: "center", marginBottom: 8 }}>
              Quer fechar essas lacunas com profundidade?
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-primary-cta"
              onClick={handleCtaClick}
            >
              Falar com um especialista BSSP
            </a>
          </div>
        </div>
      </div>

      {/* Sticky CTA — fixed bottom bar */}
      <div className="iprt-sticky-cta">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="result-primary-cta"
          onClick={handleCtaClick}
        >
          Falar com um especialista BSSP
        </a>
      </div>
    </div>
  );
}
