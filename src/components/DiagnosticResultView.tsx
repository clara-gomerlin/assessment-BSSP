"use client";

import { useRef, useCallback } from "react";
import { DimensionResult } from "@/lib/types";

interface DiagnosticAnalysis {
  type: "analysis";
  diagnostico: string;
  sinais: string[];
  impacto: string;
  contexto: string;
  contexto_bullets: string[];
  acao: string;
  acao_passos: string[];
}

interface DiagnosticResultViewProps {
  result: {
    type: "meta";
    scoreGeral: number;
    scoreGeralLabel: string;
    scoreGeralColor: string;
    dimensions: DimensionResult[];
    strongest: DimensionResult;
    weakest: DimensionResult;
    qualification: {
      faturamento: string;
      papel: string;
      emocionalTags: string[];
      crm: string;
    };
  };
  analysis: DiagnosticAnalysis | null;
  markdown: string;
  respondentName: string;
  quizSlug: string;
}

// === Radar Chart SVG ===
function RadarChart({ dimensions }: { dimensions: DimensionResult[] }) {
  const chartRadius = 90;
  const labelMargin = 55;
  const totalR = chartRadius + labelMargin;
  const size = totalR * 2 + 20; // extra safety margin
  const cx = size / 2;
  const cy = size / 2;
  const levels = 4;
  const maxRadius = chartRadius;

  const n = dimensions.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // top

  function polarToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, li) => {
    const r = ((li + 1) / levels) * maxRadius;
    const points = Array.from({ length: n }, (_, i) => {
      const a = startAngle + i * angleStep;
      return polarToXY(a, r);
    });
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  });

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) => {
    const a = startAngle + i * angleStep;
    const end = polarToXY(a, maxRadius);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  // Data polygon
  const dataPoints = dimensions.map((dim, i) => {
    const a = startAngle + i * angleStep;
    const r = (dim.normalizedScore / 100) * maxRadius;
    return polarToXY(a, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  // Labels — position further out and show full name
  const labels = dimensions.map((dim, i) => {
    const a = startAngle + i * angleStep;
    const labelR = maxRadius + 32;
    const pos = polarToXY(a, labelR);
    return { ...pos, angle: a, dim };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto", maxWidth: size }}>
      {/* Grid */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {/* Axes */}
      {axes.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {/* Data area */}
      <path d={dataPath} fill="rgba(45, 50, 70, 0.15)" stroke="#2D3246" strokeWidth={2.5} />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#2D3246" stroke="#fff" strokeWidth={2} />
      ))}
      {/* Labels — full dimension names */}
      {labels.map((l, i) => {
        // Split name into words for multi-line display
        const words = l.dim.name.split(" ");
        const line1 = `${l.dim.emoji} ${words[0]}`;
        const line2 = words.length > 1 ? words.slice(1).join(" ") : "";
        // Adjust anchor based on position
        const isTop = Math.abs(l.angle + Math.PI / 2) < 0.1;
        const isBottom = Math.abs(l.angle - Math.PI / 2) < 0.1;
        const yOffset = isTop ? -4 : isBottom ? 4 : 0;
        return (
          <g key={i}>
            <text
              x={l.x}
              y={l.y - 6 + yOffset}
              textAnchor="middle"
              fill="#0f172a"
              fontSize={10.5}
              fontWeight={600}
              fontFamily="Rubik, system-ui, sans-serif"
            >
              {line1}
            </text>
            {line2 && (
              <text
                x={l.x}
                y={l.y + 6 + yOffset}
                textAnchor="middle"
                fill="#0f172a"
                fontSize={10.5}
                fontWeight={600}
                fontFamily="Rubik, system-ui, sans-serif"
              >
                {line2}
              </text>
            )}
            <text
              x={l.x}
              y={l.y + (line2 ? 20 : 10) + yOffset}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
              fontWeight={500}
              fontFamily="Rubik, system-ui, sans-serif"
            >
              {l.dim.normalizedScore}/100
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// === Dimension Bar with micro-copy ===
function DimensionBar({
  dim,
  animDelay,
}: {
  dim: DimensionResult;
  animDelay: number;
}) {
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
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
            {dim.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="diagnostic-status-pill"
            style={{
              color: dim.color,
              background: `${dim.color}18`,
              borderColor: `${dim.color}40`,
            }}
          >
            {dim.label}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              minWidth: 48,
              textAlign: "right",
            }}
          >
            {dim.normalizedScore}/100
          </span>
        </div>
      </div>
      <div className="diagnostic-bar-track">
        <div
          className="diagnostic-bar-fill"
          style={{
            width: `${dim.normalizedScore}%`,
            background: dim.color,
            animationDelay: `${animDelay + 0.3}s`,
          }}
        />
      </div>
    </div>
  );
}

// === Analysis Cards ===
function AnalysisCards({
  analysis,
  weakest,
}: {
  analysis: DiagnosticAnalysis;
  weakest: DimensionResult;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="diag-card diag-card--red">
        <div className="diag-card__header">
          <span style={{ fontSize: 18 }}>🔴</span>
          <span className="diag-card__title">ALAVANCA MAIS FRACA</span>
        </div>
        <p className="diag-card__subtitle">
          {weakest.emoji} {weakest.name} — {weakest.normalizedScore}/100
        </p>
        <p className="diag-card__text">{analysis.diagnostico}</p>
      </div>

      {analysis.sinais?.length > 0 && (
        <div className="diag-card diag-card--amber">
          <div className="diag-card__header">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span className="diag-card__title">SINAIS DE ALERTA</span>
          </div>
          <ul className="diag-card__list">
            {analysis.sinais.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {analysis.impacto && (
            <p className="diag-card__impact">
              📉 <strong>Impacto:</strong> {analysis.impacto}
            </p>
          )}
        </div>
      )}

      <div className="diag-card diag-card--blue">
        <div className="diag-card__header">
          <span style={{ fontSize: 18 }}>✅</span>
          <span className="diag-card__title">POR QUE ISSO IMPORTA</span>
        </div>
        <p className="diag-card__text">{analysis.contexto}</p>
        {analysis.contexto_bullets?.length > 0 && (
          <ul className="diag-card__list">
            {analysis.contexto_bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="diag-card diag-card--green">
        <div className="diag-card__header">
          <span style={{ fontSize: 18 }}>🎯</span>
          <span className="diag-card__title">AÇÃO DESTA SEMANA</span>
        </div>
        <p className="diag-card__text">{analysis.acao}</p>
        {analysis.acao_passos?.length > 0 && (
          <div className="diag-card__steps">
            {analysis.acao_passos.map((step, i) => (
              <div key={i} className="diag-card__step">
                <span className="diag-card__step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === Brag Tag Generator ===
function useBragTag() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(
    async (
      name: string,
      score: number,
      scoreLabel: string,
      strongest: DimensionResult,
      weakest: DimensionResult
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#6366f1");
      grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 6);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DIAGNÓSTICO DA MÁQUINA DE RECEITA", W / 2, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 42px sans-serif";
      ctx.fillText(name, W / 2, 180);

      const ccx = W / 2;
      const ccy = 380;
      const r = 120;
      ctx.beginPath();
      ctx.arc(ccx, ccy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 16;
      ctx.stroke();

      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (score / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(ccx, ccy, r, startAngle, endAngle);
      ctx.strokeStyle = score >= 71 ? "#1dbf73" : score >= 31 ? "#f5a623" : "#e84343";
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 72px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${score}`, ccx, ccy + 20);
      ctx.font = "400 22px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("de 100", ccx, ccy + 52);

      ctx.fillStyle = "#ffffff";
      ctx.font = "600 26px sans-serif";
      ctx.fillText(scoreLabel, ccx, ccy + r + 60);

      const yBottom = 640;
      ctx.textAlign = "left";

      ctx.fillStyle = "#1dbf73";
      ctx.font = "600 22px sans-serif";
      ctx.fillText("ALAVANCA MAIS FORTE", 100, yBottom);
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 28px sans-serif";
      ctx.fillText(`${strongest.emoji} ${strongest.name}`, 100, yBottom + 40);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 22px sans-serif";
      ctx.fillText(`Score: ${strongest.normalizedScore}/100`, 100, yBottom + 72);

      ctx.fillStyle = "#e84343";
      ctx.font = "600 22px sans-serif";
      ctx.fillText("ALAVANCA MAIS FRACA", 100, yBottom + 140);
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 28px sans-serif";
      ctx.fillText(`${weakest.emoji} ${weakest.name}`, 100, yBottom + 180);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 22px sans-serif";
      ctx.fillText(`Score: ${weakest.normalizedScore}/100`, 100, yBottom + 212);

      ctx.fillStyle = "#475569";
      ctx.font = "400 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Growth Leaders Academy", ccx, H - 60);

      const link = document.createElement("a");
      link.download = `diagnostico-receita-${name.split(" ")[0].toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    []
  );

  return { canvasRef, generate };
}

// === Score Hero Section (Score + Label + Radar) ===
function ScoreHero({
  result,
  firstName,
}: {
  result: DiagnosticResultViewProps["result"];
  firstName: string;
}) {
  return (
    <div
      style={{
        opacity: 0,
        animation: "fadeUp 0.6s ease forwards",
        animationDelay: "0.2s",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "24px 0 12px" }}>
        <img
          src="/logos/gla-logo.png"
          alt="Growth Leaders Academy"
          style={{ display: "inline-block", width: 120 }}
        />
      </div>

      {/* Headline */}
      <h1
        className="result-headline"
        style={{ margin: "12px auto 20px" }}
      >
        {firstName}, aqui está o diagnóstico da sua{" "}
        <span style={{ color: "#2D3246" }}>Máquina de Receita</span>
      </h1>

      {/* Score main display */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1,
            fontFamily: "var(--font-quiz)",
          }}
        >
          {result.scoreGeral}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#94a3b8",
            fontFamily: "var(--font-quiz)",
          }}
        >
          /100
        </span>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 15,
            fontWeight: 600,
            color: result.scoreGeralColor,
            background: `${result.scoreGeralColor}18`,
            fontFamily: "var(--font-quiz)",
          }}
        >
          {result.scoreGeralLabel}
        </span>
      </div>

      {/* Radar Chart */}
      <RadarChart dimensions={result.dimensions} />
    </div>
  );
}

// === Dimensions Breakdown ===
function DimensionsBreakdown({
  result,
}: {
  result: DiagnosticResultViewProps["result"];
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 20,
          fontFamily: "var(--font-quiz)",
        }}
      >
        Breakdown por Alavanca
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {result.dimensions.map((dim, i) => (
          <DimensionBar key={dim.code} dim={dim} animDelay={0.4 + i * 0.15} />
        ))}
      </div>

      {/* Strongest / Weakest summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 24,
          opacity: 0,
          animation: "fadeUp 0.5s ease forwards",
          animationDelay: "1.2s",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: 10,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "#059669", marginBottom: 4 }}>
            MAIS FORTE
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>
            {result.strongest.emoji} {result.strongest.name}
          </p>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            {result.strongest.normalizedScore}/100
          </p>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>
            MAIS FRACA
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>
            {result.weakest.emoji} {result.weakest.name}
          </p>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            {result.weakest.normalizedScore}/100
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticResultView({
  result,
  analysis,
  markdown,
  respondentName,
  quizSlug,
}: DiagnosticResultViewProps) {
  const firstName = respondentName.split(" ")[0] || "Empresa";
  const { canvasRef, generate } = useBragTag();

  return (
    <div style={{ width: "100%", fontFamily: "var(--font-quiz)" }}>
      {/* ===== DESKTOP LAYOUT (>=768px) ===== */}
      <div className="diag-desktop-layout">
        <div className="diag-desktop-left">
          <ScoreHero result={result} firstName={firstName} />
        </div>
        <div className="diag-desktop-right">
          {/* Breakdown card */}
          <div className="result-top-card" style={{ padding: "24px 20px", marginTop: 16, animationDelay: "0.3s" }}>
            <DimensionsBreakdown result={result} />
          </div>

          {/* Analysis */}
          <div style={{ marginTop: 24 }}>
            {analysis ? (
              <AnalysisCards analysis={analysis} weakest={result.weakest} />
            ) : markdown ? (
              <div className="prose-result">
                <div style={{ whiteSpace: "pre-wrap" }}>{markdown}</div>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246" }}>▊</span>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246", fontSize: 18 }}>
                  Gerando análise personalizada...
                </span>
              </div>
            )}
          </div>

          {/* Brag + CTAs */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              onClick={() => generate(respondentName, result.scoreGeral, result.scoreGeralLabel, result.strongest, result.weakest)}
              className="diagnostic-brag-btn"
            >
              📥 Baixar meu Diagnóstico (imagem)
            </button>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", textAlign: "center", marginBottom: 8 }}>
              Quer acelerar essa mudança?
            </p>
            <a
              href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20a%20consultoria%20de%20receita"
              target="_blank"
              rel="noopener noreferrer"
              className="result-primary-cta"
            >
              Falar com um consultor no WhatsApp
            </a>
            <button onClick={() => window.location.reload()} className="result-secondary-cta">
              Refazer diagnóstico
            </button>
          </div>

          <p style={{ fontSize: 12, fontWeight: 200, color: "#515151", textAlign: "center", marginTop: 24, lineHeight: 1.3 }}>
            Resultado gerado com IA baseado nas suas respostas. Para uma análise aprofundada, fale com nosso time.
          </p>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT (<768px) ===== */}
      <div className="diag-mobile-layout">
        <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "0 20px", paddingBottom: 90 }}>
          <ScoreHero result={result} firstName={firstName} />

          {/* Breakdown card */}
          <div className="result-top-card" style={{ padding: "24px 16px 20px", animationDelay: "0.3s" }}>
            <DimensionsBreakdown result={result} />
          </div>

          {/* Analysis */}
          <div className="result-section" style={{ marginTop: 24 }}>
            {analysis ? (
              <AnalysisCards analysis={analysis} weakest={result.weakest} />
            ) : markdown ? (
              <div className="prose-result">
                <div style={{ whiteSpace: "pre-wrap" }}>{markdown}</div>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246" }}>▊</span>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <span style={{ display: "inline-block", animation: "fadeUp 0.3s ease infinite alternate", color: "#2D3246", fontSize: 18 }}>
                  Gerando análise personalizada...
                </span>
              </div>
            )}
          </div>

          {/* Brag */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              onClick={() => generate(respondentName, result.scoreGeral, result.scoreGeralLabel, result.strongest, result.weakest)}
              className="diagnostic-brag-btn"
            >
              📥 Baixar meu Diagnóstico (imagem)
            </button>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* CTAs */}
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", textAlign: "center", marginBottom: 8 }}>
              Quer acelerar essa mudança?
            </p>
            <a
              href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20a%20consultoria%20de%20receita"
              target="_blank"
              rel="noopener noreferrer"
              className="result-primary-cta"
            >
              Falar com um consultor no WhatsApp
            </a>
            <button onClick={() => window.location.reload()} className="result-secondary-cta">
              Refazer diagnóstico
            </button>
          </div>

          <p style={{ fontSize: 12, fontWeight: 200, color: "#515151", textAlign: "center", marginTop: 24, lineHeight: 1.3 }}>
            Resultado gerado com IA baseado nas suas respostas. Para uma análise aprofundada, fale com nosso time.
          </p>
        </div>
      </div>
    </div>
  );
}
