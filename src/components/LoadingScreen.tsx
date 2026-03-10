"use client";

import { useState, useEffect } from "react";

const PROGRESS_ITEMS = [
  { label: "Analisando suas respostas", duration: 3000 },
  { label: "Identificando seu arquétipo", duration: 4000 },
  { label: "Gerando recomendações personalizadas", duration: 5000 },
];

const TESTIMONIALS = [
  {
    quote:
      "Eu sabia o que queria, mas não sabia como chegar. A mentoria de carreira trouxe clareza do caminho e colocou o plano no papel.",
    author: "Mariana Marins",
    role: "Líder de Marketing @GoCache",
  },
  {
    quote:
      "Entrei na mentoria com um objetivo claro: conquistar um cargo de liderança. Durante o processo, organizei meus resultados, ajustei minha narrativa, fui promovida a gerente e depois diretora. A mentoria foi decisiva para chegar onde eu queria.",
    author: "Taciana Serafim",
    role: "Diretora de Growth e Marketing @Looptomize",
  },
  {
    quote:
      'Evoluí meu salário chegando a quase 3x o que eu ganhava antes de começar o GLA.',
    author: "Dionatha Rodrigues",
    role: "Ex-Martech Team Lead @Blip",
  },
];

const CAROUSEL_INTERVAL = 3500;

interface LoadingScreenProps {
  apiReady: boolean;
  onContinue: () => void;
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

function StarsSVG() {
  return (
    <svg width="80" height="16" viewBox="0 0 106 22" fill="none">
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

export default function LoadingScreen({ apiReady, onContinue }: LoadingScreenProps) {
  const [progresses, setProgresses] = useState([0, 0, 0]);
  const [barsFinished, setBarsFinished] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonialVisible, setTestimonialVisible] = useState(true);

  const canContinue = barsFinished && apiReady;

  // Progress bars
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const startTimes = [0, 1500, 3500];
    let finishedCount = 0;

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
          if (pct >= 100) {
            clearInterval(interval);
            finishedCount++;
            if (finishedCount === PROGRESS_ITEMS.length) {
              setBarsFinished(true);
            }
          }
        }, 50);
        intervals.push(interval);
      }, startTimes[index]);
      intervals.push(timeout as unknown as NodeJS.Timeout);
    });

    return () => intervals.forEach((i) => clearInterval(i));
  }, []);

  // Testimonial carousel (loops forever)
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialVisible(false);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
        setTestimonialVisible(true);
      }, 400);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const testimonial = TESTIMONIALS[activeTestimonial];

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
        paddingBottom: 100,
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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

        {/* Progress bars */}
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
                style={{ fontSize: 16, fontWeight: 600, color: "#000" }}
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

        {/* Testimonial carousel */}
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              padding: "16px 16px 12px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              borderRadius: 12,
              background: "#fff",
              boxShadow:
                "rgba(56,70,174,0.05) 0px 4px 9px, rgba(56,70,174,0.04) 0px 16px 16px",
              opacity: testimonialVisible ? 1 : 0,
              transition: "opacity 0.4s ease",
              minHeight: 180,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "18px 24px",
                borderRadius: 8,
                background: "#f3f6fc",
                width: "100%",
              }}
            >
              <span style={{ position: "absolute", top: 8, left: 13.5 }}>
                <QuoteSVG />
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  textAlign: "center",
                  color: "#161616",
                  lineHeight: 1.4,
                }}
              >
                {testimonial.quote}
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
            <span style={{ fontSize: 14, fontWeight: 200, color: "#000" }}>
              {testimonial.author} - {testimonial.role}
            </span>
            <StarsSVG />
          </div>

          {/* Carousel dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            {TESTIMONIALS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    i === activeTestimonial ? "#2D3246" : "rgba(45,50,70,0.2)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA button — appears when bars done + API ready */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 20px",
          textAlign: "center",
          zIndex: 999,
          background:
            "linear-gradient(rgba(250,250,250,0.8) 0%, rgba(250,250,250,0) 92.42%), linear-gradient(90deg, rgba(80,186,246,0.12) 0%, rgba(151,88,231,0.12) 91.61%), rgb(250,250,250)",
          opacity: canContinue ? 1 : 0,
          transform: canContinue ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          pointerEvents: canContinue ? "auto" : "none",
        }}
      >
        <button
          onClick={onContinue}
          className="continue-button"
          style={{ maxWidth: 480 }}
        >
          Ver meu resultado
        </button>
      </div>
    </div>
  );
}
