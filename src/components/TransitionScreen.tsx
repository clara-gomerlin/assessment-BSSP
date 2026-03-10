"use client";

interface TransitionScreenProps {
  id: string;
  onContinue: () => void;
}

const LOGO_NESTLE = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/Nestle.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvTmVzdGxlLnBuZyIsImlhdCI6MTc2ODExMzYzNiwiZXhwIjoxNzk5NjQ5NjM2fQ.1DuQJkbyrNuCppepJk-ZpYcIfT2x8BjSV8Bwwt_P_EI";
const LOGO_PAGBANK = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/Pagbank.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvUGFnYmFuay5wbmciLCJpYXQiOjE3NjgxMTM2NTAsImV4cCI6MTc5OTY0OTY1MH0.62VoTsflbTrCgaZH_wMt1rmMBaOKphRy6a0sn5wOcw0";
const LOGO_HOTMART = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/Hotmart_logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvSG90bWFydF9sb2dvLnN2ZyIsImlhdCI6MTc2ODExMzY2NSwiZXhwIjoxNzk5NjQ5NjY1fQ.epVAYt1FLhyvuh4-lZCyd-NYIz3XyOYnQx2m5I3eWgg";
const LOGO_BOTICARIO = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/Grupo%20boticario.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvR3J1cG8gYm90aWNhcmlvLnBuZyIsImlhdCI6MTc2ODExMzcwMiwiZXhwIjoxNzk5NjQ5NzAyfQ.rY-5bhHjR0BUEhGuwmL8xqO56l015ruyh3o_U7nWyro";
const LOGO_NUVEMSHOP = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/nuvemshop%2001.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvbnV2ZW1zaG9wIDAxLnBuZyIsImlhdCI6MTc2ODExMzcxOSwiZXhwIjoxNzk5NjQ5NzE5fQ.pvEXfwc6gy659avjYFrp8ciUTAz1-GD4jyf8RyJh1EM";
const LOGO_KOVI = "https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/Kovi.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvS292aS53ZWJwIiwiaWF0IjoxNzY4MTEzNzI4LCJleHAiOjE3OTk2NDk3Mjh9.RU8trxMjuO8LWKX-cd56fw8UkZZdJ5a4REWQKWuvzm4";

function StarsSVG() {
  return (
    <svg width="106" height="21" viewBox="0 0 106 22" fill="none">
      <path fill="#00B67A" d="M20.19 1.136H0v20.19h20.19z" />
      <path fill="#fff" d="m9.884 14.595 3.155-.84 1.262 3.995zm7.151-5.048h-5.467L9.885 4.499 8.203 9.547H2.944l4.417 3.155-1.682 5.048 4.417-3.155 2.735-1.893z" />
      <path fill="#00B67A" d="M41.643 1.136H21.452v20.19h20.19z" />
      <path fill="#fff" d="m31.548 14.595 3.155-.84 1.262 3.995zm6.94-5.048H33.02l-1.682-5.048-1.682 5.048h-5.469l4.417 3.155-1.682 5.048 4.417-3.155 2.735-1.893z" />
      <path fill="#00B67A" d="M63.095 1.136h-20.19v20.19h20.19z" />
      <path fill="#fff" d="m53 14.595 3.155-.84 1.262 3.995zm6.94-5.048h-5.468L52.79 4.499l-1.682 5.048h-5.469l4.417 3.155-1.471 5.048 4.417-3.155 2.733-1.893z" />
      <path fill="#00B67A" d="M84.548 1.136H64.357v20.19h20.19z" />
      <path fill="#fff" d="m74.452 14.595 3.155-.84 1.262 3.995zm7.151-5.048h-5.469l-1.682-5.048-1.682 5.048h-5.469l4.417 3.155-1.682 5.048 4.417-3.155 2.735-1.893z" />
      <path fill="#00B67A" d="M106 1.136H85.81v20.19H106z" />
      <path fill="#fff" d="m95.905 14.595 3.155-.84 1.262 3.995zm7.151-5.048h-5.469l-1.682-5.048-1.682 5.048h-5.469l4.417 3.155-1.682 5.048 4.417-3.155 2.735-1.893z" />
    </svg>
  );
}

function QuoteSVG() {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
      <path
        fill="#2D3246"
        d="M.555 10.67V7.5q0-1.35.528-2.759.528-1.41 1.395-2.657Q3.343.837 4.356 0l2.76 1.63a14.5 14.5 0 0 0-1.35 2.7q-.514 1.41-.514 3.141v3.2zm7.412 0V7.5q0-1.35.529-2.759.528-1.41 1.394-2.657T11.769 0l2.76 1.63a14.5 14.5 0 0 0-1.351 2.7q-.514 1.41-.514 3.141v3.2z"
      />
    </svg>
  );
}

/* ============================================================
   Transition 1 — Social Proof (after Perfil)
   ============================================================ */
function Transition1({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      {/* Headline */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#2D3246" }}>
          Mais de 200 alunos
        </span>
        <br />
        <span style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>
          já participaram da Mentoria de Carreira Acelerada do GLA
        </span>
      </div>

      {/* Testimonial card */}
      <div
        style={{
          display: "flex",
          padding: "16px 16px 12px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          borderRadius: 12,
          border: "2px solid #fff",
          background: "#fff",
          boxShadow:
            "rgba(56,70,174,0.05) 0px 4px 9px, rgba(56,70,174,0.04) 0px 16px 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 133,
            padding: "18px 24px",
            borderRadius: 8,
            background: "#f3f6fc",
          }}
        >
          <span style={{ position: "absolute", top: 8, left: 13.5 }}>
            <QuoteSVG />
          </span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 400,
              textAlign: "center",
              color: "#161616",
              lineHeight: 1.3,
            }}
          >
            Eu sabia o que queria, mas não sabia como chegar. A mentoria de
            carreira trouxe clareza do caminho e colocou o plano no papel.
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 13.5,
              rotate: "180deg",
            }}
          >
            <QuoteSVG />
          </span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 200, color: "#000" }}>
          Mariana Marins - Líder de Marketing @GoCache
        </span>
        <StarsSVG />
      </div>

      {/* Companies */}
      <div style={{ textAlign: "center", marginTop: 23 }}>
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#161616",
            marginBottom: 20,
          }}
        >
          Este método ajudou a acelerar a carreira de líderes em empresas como:
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {[LOGO_NESTLE, LOGO_PAGBANK, LOGO_HOTMART].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{ maxWidth: 130, height: "auto" }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          {[LOGO_BOTICARIO, LOGO_NUVEMSHOP, LOGO_KOVI].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{ maxWidth: 130, height: "auto" }}
            />
          ))}
        </div>
      </div>
    </Content>
  );
}

/* ============================================================
   Transition 2 — Growth Chart (after Perfil, page 2)
   ============================================================ */
function Transition2({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#2D3246",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 24,
        }}
      >
        A Mentoria de Carreira Acelerada do GLA te ajuda a dar seu próximo passo
        em 6 meses (ou menos!)
      </h2>

      {/* Chart illustration (SVG) */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          boxShadow: "rgba(20, 28, 40, 0.04) 0 8px 24px",
          marginBottom: 24,
        }}
      >
        <svg viewBox="0 0 400 200" style={{ width: "100%", height: "auto" }}>
          {/* Grid */}
          <line x1="50" y1="20" x2="50" y2="180" stroke="#e9e9ef" strokeWidth="1" />
          <line x1="50" y1="180" x2="380" y2="180" stroke="#e9e9ef" strokeWidth="1" />
          {[60, 100, 140].map((y) => (
            <line key={y} x1="50" y1={y} x2="380" y2={y} stroke="#e9e9ef" strokeWidth="0.5" strokeDasharray="4" />
          ))}

          {/* Y-axis label */}
          <text x="10" y="105" fontSize="9" fill="#6c7280" fontWeight="500" transform="rotate(-90, 18, 105)" textAnchor="middle">
            Reconhecimento
          </text>

          {/* "COM MENTORIA" label */}
          <rect x="60" y="15" width="90" height="18" rx="4" fill="#1dbf73" />
          <text x="105" y="28" fontSize="9" fill="#fff" fontWeight="600" textAnchor="middle">
            COM MENTORIA
          </text>

          {/* Green line (with mentoring) */}
          <polyline
            points="60,155 120,140 180,120 240,90 300,55 360,30"
            fill="none"
            stroke="#1dbf73"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Green area */}
          <polygon
            points="60,155 120,140 180,120 240,90 300,55 360,30 360,180 60,180"
            fill="#1dbf73"
            opacity="0.12"
          />

          {/* "SEM MENTORIA" label */}
          <rect x="60" y="130" width="90" height="18" rx="4" fill="#e84343" />
          <text x="105" y="143" fontSize="9" fill="#fff" fontWeight="600" textAnchor="middle">
            SEM MENTORIA
          </text>

          {/* Red line (without mentoring) */}
          <polyline
            points="60,160 120,158 180,155 240,150 300,148 360,145"
            fill="none"
            stroke="#e84343"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Red area */}
          <polygon
            points="60,160 120,158 180,155 240,150 300,148 360,145 360,180 60,180"
            fill="#e84343"
            opacity="0.12"
          />

          {/* Dots */}
          <circle cx="240" cy="90" r="6" fill="#fff" stroke="#1dbf73" strokeWidth="2" />
          <circle cx="300" cy="148" r="6" fill="#fff" stroke="#e84343" strokeWidth="2" />

          {/* X-axis labels */}
          {["Dec", "Jan", "Fev", "Mar", "Abr", "Mai"].map((m, i) => (
            <text key={m} x={60 + i * 60} y="196" fontSize="10" fill="#5f687b" fontWeight="500" textAnchor="middle">
              {m}
            </text>
          ))}
        </svg>
      </div>

      {/* Testimonial */}
      <div
        style={{
          position: "relative",
          padding: "18px 24px",
          borderRadius: 8,
          background: "#f3f6fc",
          marginBottom: 8,
        }}
      >
        <span style={{ position: "absolute", top: 8, left: 13.5 }}>
          <QuoteSVG />
        </span>
        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            textAlign: "center",
            color: "#161616",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Entrei na mentoria com um objetivo claro: conquistar um cargo de
          liderança. Durante o processo, organizei meus resultados, ajustei
          minha narrativa, fui promovida a gerente e depois diretora. A mentoria
          foi decisiva para chegar onde eu queria.
        </p>
        <span
          style={{
            position: "absolute",
            bottom: 8,
            right: 13.5,
            rotate: "180deg",
          }}
        >
          <QuoteSVG />
        </span>
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          textAlign: "center",
          color: "#000",
        }}
      >
        Taciana Serafim - Diretora de Growth e Marketing @Looptomize
      </p>
    </Content>
  );
}

/* ============================================================
   Transition 3 — Comparison (after Desafios)
   ============================================================ */
function Transition3({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#0f172a",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 28,
        }}
      >
        A mentoria do GLA acelera resultados
      </h2>

      {/* Comparison */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#475569",
              marginBottom: 12,
            }}
          >
            Carreira típica
          </h3>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: "20px 28px",
              minWidth: 150,
            }}
          >
            <strong
              style={{ display: "block", fontSize: "1.8rem", color: "#0f172a" }}
            >
              2 anos
            </strong>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
              para o próximo passo
            </span>
          </div>
        </div>

        <span style={{ fontWeight: 400, color: "#2D3246", fontSize: 14 }}>
          vs
        </span>

        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#475569",
              marginBottom: 12,
            }}
          >
            Com Mentoria GLA
          </h3>
          <div
            style={{
              background: "rgba(45, 50, 70, 0.15)",
              borderRadius: 12,
              padding: "20px 28px",
              minWidth: 150,
            }}
          >
            <strong
              style={{ display: "block", fontSize: "1.8rem", color: "#0f172a" }}
            >
              6 meses
            </strong>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
              para o próximo passo
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <p style={{ fontSize: "1rem", color: "#334155" }}>
          🎯 <strong>Clareza:</strong> Você entende exatamente seu próximo passo
          de carreira
        </p>
        <p style={{ fontSize: "1rem", color: "#334155" }}>
          ⭐ <strong>Confiança:</strong> Você assume protagonismo sem medo de
          &quot;parecer arrogante&quot;
        </p>
        <p style={{ fontSize: "1rem", color: "#334155" }}>
          🏆 <strong>Autoridade:</strong> Profissionais acelerados
        </p>
      </div>

      {/* Testimonial */}
      <div
        style={{
          margin: "0 0 16px",
          background: "#f8fafc",
          borderLeft: "4px solid #2D3246",
          padding: "16px 20px",
          borderRadius: 8,
          fontSize: "0.95rem",
          color: "#334155",
        }}
      >
        &quot;Evoluí meu salário chegando a quase{" "}
        <strong>3x</strong> o que eu ganhava antes de começar o GLA&quot;
        <br />
        <em>
          — Dionatha Rodrigues - Ex-Martech Team Lead @ Blip
        </em>
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Resultados individuais podem variar.
      </p>
    </Content>
  );
}

/* ============================================================
   Shared layout wrapper
   ============================================================ */
function Content({
  children,
  onContinue,
}: {
  children: React.ReactNode;
  onContinue: () => void;
}) {
  return (
    <div style={{ width: "100%" }}>
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "0px 20px",
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 0,
          paddingBottom: 120,
          marginTop: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>{children}</div>
      </div>

      {/* Fixed continue button — outside animated div to avoid translateY glitch */}
      <div
        style={{
          position: "fixed",
          width: "100%",
          padding: "10px 20px",
          textAlign: "center",
          bottom: 0,
          left: 0,
          zIndex: 999,
          background: "linear-gradient(rgba(250,250,250,0.8) 0%, rgba(250,250,250,0) 92.42%), linear-gradient(90deg, rgba(80,186,246,0.12) 0%, rgba(151,88,231,0.12) 91.61%), rgb(250,250,250)",
        }}
      >
        <button
          onClick={onContinue}
          className="continue-button"
          style={{ maxWidth: 480 }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Main export — picks the right transition by id
   ============================================================ */
export default function TransitionScreen({
  id,
  onContinue,
}: TransitionScreenProps) {
  switch (id) {
    case "after-perfil-1":
      return <Transition1 onContinue={onContinue} />;
    case "after-perfil-2":
      return <Transition2 onContinue={onContinue} />;
    case "after-desafios":
      return <Transition3 onContinue={onContinue} />;
    default:
      return null;
  }
}
