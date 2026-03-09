"use client";

import DOMPurify from "dompurify";
import { Dimension } from "@/lib/types";

interface ResultViewProps {
  archetype: { code: string; name: string; emoji: string; description: string };
  secondary: { code: string; name: string; emoji: string; description: string };
  scores: Record<string, number>;
  dimensions: Dimension[];
  markdown: string;
  respondentName: string;
}

export default function ResultView({
  archetype,
  secondary,
  scores,
  dimensions,
  markdown,
  respondentName,
}: ResultViewProps) {
  const maxScore = Math.max(...Object.values(scores), 1);
  const potentialPct = Math.min(
    Math.round((scores[archetype.code] / maxScore) * 100),
    100
  );

  const firstName = respondentName.split(" ")[0] || "Profissional";

  return (
    <div
      style={{
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        padding: "0 20px",
        paddingBottom: 90,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "24px 0 12px" }}>
        <img
          src="https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/GROWTH%20LEADERS%20ACADEMY%20PRETO%20(PNG).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvR1JPV1RIIExFQURFUlMgQUNBREVNWSBQUkVUTyAoUE5HKS5wbmciLCJpYXQiOjE3Njc5ODE0NDQsImV4cCI6MTc5OTUxNzQ0NH0.nJgiHiKpuwQrWTMoMAH3n7Osb0HvZVXzcFhJr7Je0Z8"
          alt="Growth Leaders Academy"
          style={{ display: "inline-block", width: 120 }}
        />
      </div>

      {/* Headline */}
      <h1
        className="result-headline"
        style={{
          opacity: 0,
          animation: "fadeUp 0.6s ease forwards",
          animationDelay: "0.2s",
        }}
      >
        {firstName}, seu arquétipo é:{" "}
        <span style={{ color: "#2D3246" }}>
          {archetype.emoji} {archetype.name}
        </span>
      </h1>

      {/* Top Card: Potential + Profile */}
      <div className="result-top-card">
        {/* Potential Meter */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "#000",
              }}
            >
              Seu potencial de crescimento
            </span>
            <span
              style={{
                color: "#19ba63",
                fontSize: 12,
                fontWeight: 400,
                padding: "5px 8px",
                border: "1px solid #19ba63",
                background: "#daf8df",
                borderRadius: 4,
              }}
            >
              Acima da média
            </span>
          </div>

          {/* Scale line (gradient bar with animated slider) */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#f3f6fc",
              borderRadius: 8,
              marginTop: 22,
            }}
          >
            <div className="scale-line">
              <div className="slider-wrapper">
                <div className="slider-tooltip">
                  Você está aqui
                </div>
                <div className="slider-dot" />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5f687b" }}>
                Estagnado
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5f687b" }}>
                Em crescimento
              </span>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div style={{ padding: "12px 16px 8px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              rowGap: 14,
            }}
          >
            {dimensions.map((dim, i) => {
              const score = scores[dim.code] || 0;
              const isWinner = dim.code === archetype.code;

              return (
                <div
                  key={dim.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: 0,
                    animation: "fadeUp 0.5s ease forwards",
                    animationDelay: `${1.9 + i * 0.15}s`,
                  }}
                >
                  <span style={{ fontSize: 28, lineHeight: 1, width: 28, flexShrink: 0 }}>
                    {dim.emoji}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#5f687b" }}>
                      {dim.name}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: isWinner ? 600 : 400,
                        color: isWinner ? "#2D3246" : "#000",
                      }}
                    >
                      {score} pts {isWinner && "★"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="summary-note">
          <span
            style={{
              color: "#19ba63",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            💡 Perfil secundário
          </span>
          <span
            style={{
              color: "#000",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.3,
              textAlign: "start",
            }}
          >
            {secondary.emoji} {secondary.name}: {secondary.description}
          </span>
        </div>
      </div>

      {/* AI Analysis (streamed markdown) */}
      <div className="result-section" style={{ marginTop: 24 }}>
        <div className="prose-result">
          <div
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatMarkdown(markdown), { ALLOWED_TAGS: ["h1","h2","h3","strong","em","li","ul","br"], ALLOWED_ATTR: ["style"] }) }}
          />
          {markdown && (
            <span
              style={{
                display: "inline-block",
                animation: "fadeUp 0.3s ease infinite alternate",
                color: "#2D3246",
              }}
            >
              ▊
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 640,
          margin: "32px auto 0",
        }}
      >
        <a
          href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20a%20mentoria"
          target="_blank"
          rel="noopener noreferrer"
          className="result-primary-cta"
        >
          Falar com um consultor no WhatsApp
        </a>
        <button
          onClick={() => window.location.reload()}
          className="result-secondary-cta"
        >
          Refazer diagnóstico
        </button>
      </div>

      {/* Footer note */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 200,
          color: "#515151",
          textAlign: "center",
          marginTop: 24,
          lineHeight: 1.3,
        }}
      >
        Resultado gerado com IA baseado nas suas respostas. Para uma análise
        aprofundada, fale com nosso time.
      </p>
    </div>
  );
}

function formatMarkdown(md: string): string {
  if (!md) return "";

  return md
    .replace(/### (.*?)(\n|$)/g, '<h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:20px 0 8px">$1</h3>')
    .replace(/## (.*?)(\n|$)/g, '<h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:24px 0 8px">$1</h2>')
    .replace(/# (.*?)(\n|$)/g, '<h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:24px 0 8px">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a;font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*?)$/gm, '<li style="margin-bottom:6px;color:#334155">$1</li>')
    .replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="padding-left:20px;margin:12px 0;list-style:disc">$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
