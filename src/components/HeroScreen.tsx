"use client";

interface HeroScreenProps {
  onStart: () => void;
}

export default function HeroScreen({ onStart }: HeroScreenProps) {
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
          background: `
            radial-gradient(ellipse 80% 60% at 10% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 90% 20%, rgba(129, 140, 248, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(99, 102, 241, 0.04) 0%, transparent 40%),
            linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)
          `,
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
        <img
          src="https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/GROWTH%20LEADERS%20ACADEMY%20PRETO%20(PNG).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvR1JPV1RIIExFQURFUlMgQUNBREVNWSBQUkVUTyAoUE5HKS5wbmciLCJpYXQiOjE3Njc5ODE0NDQsImV4cCI6MTc5OTUxNzQ0NH0.nJgiHiKpuwQrWTMoMAH3n7Osb0HvZVXzcFhJr7Je0Z8"
          alt="Growth Leaders Academy"
          style={{ display: "block", width: 150 }}
        />
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
            justifyContent: "center",
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
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                lineHeight: 1.15,
                color: "#0f172a",
                marginBottom: 24,
                letterSpacing: "-0.02em",
              }}
            >
              Diagnóstico<br />
              de Carreira:<br />
              Os 5 Arquétipos
            </h1>
            <p
              style={{
                fontSize: "clamp(0.9375rem, 3.5vw, 1.0625rem)",
                color: "#64748b",
                lineHeight: 1.55,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              90% dos profissionais de marketing preocupados com sua carreira se
              encaixam em um desses 5 arquétipos. Qual é o seu?
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
            {[
              { icon: "⭐", value: "4.9", label: "no Google" },
              { icon: "⏱️", value: "3", label: "minutos" },
              { icon: "👥", value: "+2.000", label: "profissionais" },
            ].map((badge) => (
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
              Ao final do diagnóstico, você vai ter:
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
              {[
                "Clareza de qual dos 5 arquétipos você se encaixa",
                "Os problemas mais comuns de quem tem o seu perfil",
                "O ponto focal que destrava profissionais como você",
                "Guia completo com aulas específicas para o seu arquétipo",
              ].map((item) => (
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
                      background: "#10b981",
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
              Baseado em +200 mentorias individuais e padrões reais de
              profissionais de marketing
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
            background: "#0f172a",
            color: "white",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase" as const,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
          }}
        >
          Começar
        </button>
      </div>
    </div>
  );
}
