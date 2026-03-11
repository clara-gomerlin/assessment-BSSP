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
          src="https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/GROWTH%20LEADERS%20ACADEMY%20PRETO%20(PNG).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvR1JPV1RIIExFQURFUlMgQUNBREVNWSBQUkVUTyAoUE5HKS5wbmciLCJpYXQiOjE3Njc5ODE0NDQsImV4cCI6MTc5OTUxNzQ0NH0.nJgiHiKpuwQrWTMoMAH3n7Osb0HvZVXzcFhJr7Je0Z8"
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
