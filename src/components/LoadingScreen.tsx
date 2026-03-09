"use client";

import { useState, useEffect } from "react";

const PROGRESS_ITEMS = [
  { label: "Analisando suas respostas", duration: 3000 },
  { label: "Identificando seu arquétipo", duration: 4000 },
  { label: "Gerando recomendações personalizadas", duration: 5000 },
];

export default function LoadingScreen() {
  const [progresses, setProgresses] = useState([0, 0, 0]);

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const startTimes = [0, 1500, 3500];

    PROGRESS_ITEMS.forEach((item, index) => {
      const timeout = setTimeout(() => {
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const pct = Math.min((elapsed / item.duration) * 100, 100);
          setProgresses((prev) => {
            const next = [...prev];
            next[index] = pct;
            return next;
          });
          if (pct >= 100) clearInterval(interval);
        }, 50);
        intervals.push(interval);
      }, startTimes[index]);
      intervals.push(timeout as unknown as NodeJS.Timeout);
    });

    return () => intervals.forEach((i) => clearInterval(i));
  }, []);

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
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          padding: "12px 0",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#000",
              marginBottom: 8,
            }}
          >
            Preparando seu resultado...
          </h2>
          <p style={{ fontSize: 14, color: "#5f687b" }}>
            Estamos criando sua análise personalizada
          </p>
        </div>

        {PROGRESS_ITEMS.map((item, index) => (
          <div key={item.label} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#5f687b",
                  minWidth: 32,
                }}
              >
                {Math.round(progresses[index])}%
              </span>
            </div>
            <div className="progress-bar-result">
              <div
                className="progress-bar-fill"
                style={{ width: `${progresses[index]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
