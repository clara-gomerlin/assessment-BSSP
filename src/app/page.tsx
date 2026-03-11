import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <img
          src="/logos/gla-logo.png"
          alt="Growth Leaders Academy"
          style={{ display: "inline-block", width: 180, marginBottom: 32 }}
        />
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "2rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Plataforma de Assessments
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: "1.1rem",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Assessments para profissionais de marketing e growth.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            href="/quiz/diagnostico-carreira"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: 12,
              fontSize: "1rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Fazer o Diagnóstico de Carreira
          </Link>
          <Link
            href="/quiz/iprt-reforma-tributaria"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid rgba(15,23,42,0.15)",
              borderRadius: 12,
              fontSize: "1rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            IPRT — Reforma Tributária (BSSP)
          </Link>
        </div>
      </div>
    </div>
  );
}
