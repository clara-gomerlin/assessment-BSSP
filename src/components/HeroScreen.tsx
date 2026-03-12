"use client";

interface HeroScreenProps {
  quiz?: { settings?: { quiz_type?: string }; title?: string; description?: string };
  onStart: () => void;
}

export default function HeroScreen({ quiz, onStart }: HeroScreenProps) {
  const isDiagnostic = quiz?.settings?.quiz_type === "diagnostic";
  const isIPRT = quiz?.settings?.quiz_type === "iprt";
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: isIPRT
            ? `radial-gradient(ellipse 80% 60% at 10% 90%, rgba(3, 29, 49, 0.06) 0%, transparent 50%),
               radial-gradient(ellipse 60% 50% at 90% 20%, rgba(3, 29, 49, 0.04) 0%, transparent 50%),
               linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`
            : `radial-gradient(ellipse 80% 60% at 10% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
               radial-gradient(ellipse 60% 50% at 90% 20%, rgba(129, 140, 248, 0.06) 0%, transparent 50%),
               radial-gradient(ellipse 100% 80% at 50% 100%, rgba(99, 102, 241, 0.04) 0%, transparent 40%),
               linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`,
        }}
      />

      {/* Header with logo */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          justifyContent: "center",
          animation: "fadeSlideDown 0.6s ease-out",
        }}
      >
        {isIPRT ? (
          <img
            src="/logos/bssp-pos-graduacao.png"
            alt="BSSP Pós-Graduação"
            style={{ display: "block", height: 48 }}
          />
        ) : (
          <img
            src="/logos/gla-logo.png"
            alt="Growth Leaders Academy"
            style={{ display: "block", width: 150 }}
          />
        )}
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          paddingBottom: "calc(80px + 32px)",
          maxWidth: 540,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: isIPRT ? "flex-start" : "center",
            paddingTop: isIPRT ? 16 : 0,
            gap: 32,
          }}
        >
          {/* Hero */}
          <section
            style={{
              textAlign: "center",
              animation: "fadeSlideUp 0.7s ease-out 0.1s both",
            }}
          >
            <h1
              style={{
                fontFamily: isIPRT ? "'Montserrat', system-ui, sans-serif" : isDiagnostic ? "var(--font-quiz)" : "'Fraunces', Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                lineHeight: 1.15,
                color: isIPRT ? "#031D31" : "#0f172a",
                marginBottom: 24,
                letterSpacing: "-0.02em",
              }}
            >
              {isIPRT ? (
                <>Índice de Prontidão<br />para a Reforma<br />Tributária</>
              ) : isDiagnostic ? (
                <>Auditoria de eficiência em receita</>
              ) : (
                <>Diagnóstico<br />de Carreira:<br />Os 5 Arquétipos</>
              )}
            </h1>
            {isDiagnostic && (
              <p
                style={{
                  fontSize: "clamp(1.1rem, 4vw, 1.35rem)",
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.3,
                  maxWidth: 400,
                  margin: "8px auto 0",
                }}
              >
                Descubra onde está vazando dinheiro na sua operação de receita
              </p>
            )}
            <p
              style={{
                fontSize: "clamp(0.9375rem, 3.5vw, 1.0625rem)",
                color: "#64748b",
                lineHeight: 1.55,
                maxWidth: 400,
                margin: isDiagnostic ? "16px auto 0" : "0 auto",
              }}
            >
              {isIPRT
                ? "Descubra seu Índice de Prontidão para a Reforma Tributária — e onde estão suas maiores lacunas antes que o novo sistema entre em vigor."
                : isDiagnostic
                ? "Baseado em +200 consultorias, esta análise revela o que não aparece no seu dashboard:"
                : "90% dos profissionais de marketing preocupados com sua carreira se encaixam em um desses 5 arquétipos. Qual é o seu?"}
            </p>
          </section>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              animation: "fadeSlideUp 0.7s ease-out 0.2s both",
            }}
          >
            {(isIPRT
              ? [
                  { icon: "🎓", value: "NPS +93", label: "" },
                  { icon: "⏱️", value: "7", label: "minutos" },
                  { icon: "👥", value: "+10.000", label: "alunos" },
                ]
              : isDiagnostic
              ? [
                  { icon: "📈", value: "", label: "Alavancas de receita desligadas" },
                  { icon: "🤑", value: "", label: "Dinheiro parado no CRM" },
                  { icon: "🔍", value: "", label: "Oportunidades sem investir em ADS" },
                ]
              : [
                  { icon: "⭐", value: "4.9", label: "no Google" },
                  { icon: "⏱️", value: "3", label: "minutos" },
                  { icon: "👥", value: "+2.000", label: "profissionais" },
                ]
            ).map((badge) => (
              <span
                key={badge.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 9999,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#334155",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>{badge.icon}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{badge.value}</span>
                <span>{badge.label}</span>
              </span>
            ))}
          </div>

          {/* Benefits */}
          <section
            style={{ animation: "fadeSlideUp 0.7s ease-out 0.3s both" }}
          >
            <p
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#64748b",
                marginBottom: 16,
              }}
            >
              {isIPRT
                ? "Ao final do diagnóstico, você vai ter:"
                : isDiagnostic
                ? <><strong style={{ fontWeight: 700, color: "#0f172a" }}>15 minutos, 25 perguntas e um mapa claro de onde agir.</strong></>
                : "Ao final do diagnóstico, você vai ter:"}
            </p>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: 0,
                margin: 0,
              }}
            >
              {(isIPRT
                ? [
                    "Seu Índice de Prontidão (IPRT) de 0% a 100%",
                    "Score detalhado em 4 dimensões de preparo",
                    "Suas maiores lacunas identificadas com precisão",
                    "Análise personalizada por IA com recomendações",
                  ]
                : isDiagnostic
                ? []
                : [
                    "Clareza de qual dos 5 arquétipos você se encaixa",
                    "Os problemas mais comuns de quem tem o seu perfil",
                    "O ponto focal que destrava profissionais como você",
                    "Guia completo com aulas específicas para o seu arquétipo",
                  ]
              ).map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: "0.9375rem",
                    color: "#334155",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      background: isIPRT ? "#031D31" : "#10b981",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 12, height: 12 }}
                    >
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
                fontSize: "0.8125rem",
                color: "#64748b",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {isIPRT
                ? "Diagnóstico gratuito. Desenvolvido pela BSSP com base na experiência de +10.000 alunos."
                : isDiagnostic
                ? null
                : "Baseado em +200 mentorias individuais e padrões reais de profissionais de marketing"}
            </p>
          </section>
        </div>
      </main>

      {/* Fixed CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 24px",
          background: "linear-gradient(to top, #ffffff 60%, transparent)",
          animation: "fadeSlideUp 0.7s ease-out 0.4s both",
        }}
      >
        <button
          onClick={onStart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 540,
            margin: "0 auto",
            padding: "16px 32px",
            background: isIPRT ? "#32373c" : "#2D3246",
            color: "white",
            fontFamily: isIPRT ? "'Montserrat', system-ui, sans-serif" : "'DM Sans', system-ui, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase" as const,
            border: "none",
            borderRadius: isIPRT ? 9999 : 12,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
          }}
        >
          {isDiagnostic ? "Iniciar minha auditoria" : "Começar"}
        </button>
      </div>
    </div>
  );
}
