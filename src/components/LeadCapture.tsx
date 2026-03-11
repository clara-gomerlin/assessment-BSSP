"use client";

import { useState } from "react";

interface LeadCaptureProps {
  onSubmit: (name: string, email: string, phone: string) => void;
  quizType?: string;
}

function formatLocal(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function getDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export default function LeadCapture({ onSubmit, quizType }: LeadCaptureProps) {
  const isIPRT = quizType === "iprt";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Por favor, insira seu nome";
    if (!email.trim()) newErrors.email = "Por favor, insira seu e-mail";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "E-mail inválido";
    const digits = getDigits(phone);
    if (!digits) newErrors.phone = "Por favor, insira seu telefone";
    else if (digits.length < 10 || digits.length > 11)
      newErrors.phone = "Número inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatLocal(e.target.value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), email.trim(), `+55 ${phone.trim()}`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        padding: "0 20px",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", paddingTop: 24 }}>
        {isIPRT ? (
          <div style={{ background: "#031D31", borderRadius: 10, padding: "8px 20px", display: "inline-block" }}>
            <img
              src="/logos/bssp-white.png"
              alt="BSSP Centro Educacional"
              style={{ display: "block", height: 28 }}
            />
          </div>
        ) : (
          <img
            src="https://jiqahhuftixaxyebtpyr.supabase.co/storage/v1/object/sign/Tools/Quiz%20RiseGuide/Images/GROWTH%20LEADERS%20ACADEMY%20PRETO%20(PNG).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84OWE3YjUwMS0xZDc0LTQyMjctODE4Zi1jNmEzNWUzMGViODUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJUb29scy9RdWl6IFJpc2VHdWlkZS9JbWFnZXMvR1JPV1RIIExFQURFUlMgQUNBREVNWSBQUkVUTyAoUE5HKS5wbmciLCJpYXQiOjE3Njc5ODE0NDQsImV4cCI6MTc5OTUxNzQ0NH0.nJgiHiKpuwQrWTMoMAH3n7Osb0HvZVXzcFhJr7Je0Z8"
            alt="Growth Leaders Academy"
            style={{ display: "inline-block", width: 120 }}
          />
        )}
      </div>

      {/* Headline */}
      <div style={{ textAlign: "center", margin: "36px 0 32px" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: isIPRT ? "#031D31" : "#000",
            lineHeight: 1.3,
            fontFamily: isIPRT ? "'Montserrat', system-ui, sans-serif" : undefined,
          }}
        >
          {isIPRT ? (
            <>Descubra seu Índice de Prontidão e receba{" "}
            <span style={{ color: "#64748b" }}>insights personalizados</span></>
          ) : (
            <>Descubra seu arquétipo e receba um guia para{" "}
            <span style={{ color: "#64748b" }}>acelerar a carreira</span></>
          )}
        </h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`email-input ${errors.name ? "email-input-error" : ""}`}
          />
          {errors.name && (
            <p style={{ fontSize: 12, color: "rgb(240, 108, 77)", margin: "8px 0 0", textAlign: "start" }}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`email-input ${errors.email ? "email-input-error" : ""}`}
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: "rgb(240, 108, 77)", margin: "8px 0 0", textAlign: "start" }}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div
            className={`email-input ${errors.phone ? "email-input-error" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <span
              style={{
                padding: "0 0 0 18px",
                fontSize: 16,
                color: "#555",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                lineHeight: "52px",
                fontFamily: "var(--font-body)",
              }}
            >
              +55
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(99) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: 1,
                height: 52,
                padding: "0 18px 0 6px",
                fontSize: 16,
                fontFamily: "var(--font-body)",
                minWidth: 0,
              }}
            />
          </div>
          {errors.phone && (
            <p style={{ fontSize: 12, color: "rgb(240, 108, 77)", margin: "8px 0 0", textAlign: "start" }}>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Privacy note */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, fontWeight: 400, color: "#5f687b", lineHeight: 1.4, margin: 0 }}>
            Respeitamos a sua privacidade e estamos empenhados em proteger os seus dados pessoais.
          </p>
        </div>

        {/* Gift box CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 12,
            background: "linear-gradient(90deg, rgba(45, 50, 70, 0.08) 0%, rgba(45, 50, 70, 0.16) 100%)",
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🎁</span>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#000", lineHeight: 1.4, margin: 0 }}>
            {isIPRT ? (
              <>Garanta que seu email é válido! Vamos enviar seu{" "}
              <strong>relatório completo de prontidão</strong> para lá.</>
            ) : (
              <>Garanta que seu email é válido! Vamos mandar seu{" "}
              <strong>Guia de Arquétipos de Carreira</strong> para lá.</>
            )}
          </p>
        </div>

        {/* Submit button — fixed at bottom */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 20px",
            textAlign: "center",
            zIndex: 999,
            background: "linear-gradient(rgba(250,250,250,0.8) 0%, rgba(250,250,250,0) 92.42%), linear-gradient(90deg, rgba(80,186,246,0.12) 0%, rgba(151,88,231,0.12) 91.61%), rgb(250,250,250)",
          }}
        >
          <button type="submit" className="continue-button" style={{ maxWidth: 480 }}>
            Ver meu resultado
          </button>
        </div>
      </form>
    </div>
  );
}
