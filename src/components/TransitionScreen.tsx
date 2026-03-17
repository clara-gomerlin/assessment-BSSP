"use client";

interface TransitionScreenProps {
  id: string;
  onContinue: () => void;
}

const LOGO_NESTLE = "/logos/companies/nestle.png";
const LOGO_PAGBANK = "/logos/companies/pagbank.png";
const LOGO_HOTMART = "/logos/companies/hotmart.svg";
const LOGO_BOTICARIO = "/logos/companies/boticario.png";
const LOGO_NUVEMSHOP = "/logos/companies/nuvemshop.png";
const LOGO_KOVI = "/logos/companies/kovi.webp";

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
            background: "rgba(255,255,255,0.04)",
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
              color: "var(--text-on-dark)",
              lineHeight: 1.4,
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
          Mariana Marins — Líder de Marketing @GoCache
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
          color: "var(--text-on-dark-secondary)",
        }}
      >
        Taciana Serafim — Diretora de Growth e Marketing @Looptomize
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
          — Dionatha Rodrigues — Ex-Martech Team Lead @Blip
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
          fontFamily: "var(--font-quiz)",
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
   Revenue Transition — Confiança intro (before Score de Confiança)
   ============================================================ */
function RevenueConfiancaIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#2D3246",
            lineHeight: 1.3,
            marginBottom: 12,
          }}
        >
          Todo líder de receita deve ser capaz de{" "}
          <strong>responder 5 perguntas.</strong>
        </h1>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "var(--text-on-dark-secondary)",
            lineHeight: 1.4,
            marginBottom: 24,
          }}
        >
          Apenas 5. Maaaas...{"\n"}Com velocidade e confiança.
        </h2>
        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: "var(--text-on-dark-secondary)",
            lineHeight: 1.5,
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Descubra quais são as perguntas e selecione a resposta que mais se adequa a sua realidade. Seja sincero!
        </p>
      </div>
    </Content>
  );
}

/* ============================================================
   Revenue Social Proof — Reusable template
   ============================================================ */
function RevenueSocialProofCard({
  onContinue,
  title1,
  title2,
  quote,
  author,
  footer,
}: {
  onContinue: () => void;
  title1: string;
  title2: string;
  quote: React.ReactNode;
  author: React.ReactNode;
  footer: string;
}) {
  return (
    <Content onContinue={onContinue}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#2D3246" }}>
          {title1}
        </span>
        <br />
        <span style={{ fontSize: 16, fontWeight: 600, color: "#2D3246" }}>
          {title2}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          padding: "16px 16px 12px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          borderRadius: 12,
          background: "var(--bg-dark-elevated)",
          border: "1px solid rgba(255,255,255,0.08)",
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
            width: "100%",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <span style={{ position: "absolute", top: 8, left: 12 }}>
            <QuoteSVG />
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 400,
              textAlign: "center",
              color: "var(--text-on-dark)",
              lineHeight: 1.4,
            }}
          >
            {quote}
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
        <span style={{ fontSize: 14, fontWeight: 200, color: "var(--text-on-dark-secondary)", textAlign: "center", display: "block" }}>
          {author}
        </span>
        <StarsSVG />
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--text-on-dark-secondary)",
            lineHeight: 1.5,
          }}
        >
          {footer}
        </p>
      </div>
    </Content>
  );
}

/* ============================================================
   Revenue Transition 1 — Copy 01
   ============================================================ */
function RevenueSocialProof1({ onContinue }: { onContinue: () => void }) {
  return (
    <RevenueSocialProofCard
      onContinue={onContinue}
      title1="+200 empresas"
      title2="já usaram esse framework para destravar receita"
      quote="Com o apoio estratégico do GLA adotamos uma mentalidade de growth, implementamos frameworks de testes e imprimimos ritmo na cultura de experimentação."
      author={<>Marcos Caringi — Dir. Marketing @Manual<br />ex-Head of Growth @Globo</>}
      footer="Baseado nas 4 alavancas de receita: Posicionamento & Preço, Geração de Demanda, Eficiência em Vendas e Expansão de Base."
    />
  );
}

/* ============================================================
   Revenue Transition — Copy 02
   ============================================================ */
function RevenueSocialProof3({ onContinue }: { onContinue: () => void }) {
  return (
    <RevenueSocialProofCard
      onContinue={onContinue}
      title1="Antes de investir mais em aquisição"
      title2="encontre sua receita escondida"
      quote="Com ajuda do GLA, eu e a equipe da Caffeine Army aumentamos a retenção de clientes em 33% e reduzimos o CAC de facebook em 50%."
      author="Josean Neto - Líder de Growth @CaffeineArmy"
      footer="O diagnóstico identifica sua melhor alavanca de receita sem investir mais em ADS."
    />
  );
}

/* ============================================================
   Revenue Transition — Copy 03
   ============================================================ */
function RevenueSocialProof4({ onContinue }: { onContinue: () => void }) {
  return (
    <RevenueSocialProofCard
      onContinue={onContinue}
      title1="Toda empresa B2B que cresce rápido"
      title2="tem receita escondida na operação"
      quote={<>Quando os desafios de Growth começaram a escalar a consultoria do GLA trouxe <br />expertise técnica, e qualidade nas discussões sobre as alavancas.</>}
      author={<>Marco Piacentini — Head of Growth<br />@Quero Educação</>}
      footer="Consultoria que entrega método, diagnóstico com dados, plano de ação e ritmo de execução."
    />
  );
}

/* ============================================================
   Revenue Transition — Copy 04
   ============================================================ */
function RevenueSocialProof5({ onContinue }: { onContinue: () => void }) {
  return (
    <RevenueSocialProofCard
      onContinue={onContinue}
      title1="Se o CAC subir amanhã"
      title2="você sabe qual alavanca mexer?"
      quote="Antes da consultoria, faltava clareza sobre o que priorizar para gerar resultado. Com o GLA, montamos um plano com dados e executamos! Hoje tenho total confiança do time e, principalmente, do CEO."
      author="Renan Fernandes — Ex-Head of Growth @Movidesk"
      footer="Método aplicado em empresas B2B que faturam de R$5M a R$100M/ano."
    />
  );
}

/* ============================================================
   Revenue Transition 2 — Framework explanation
   ============================================================ */
function RevenueSocialProof2({ onContinue }: { onContinue: () => void }) {
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
        As 4 alavancas que definem o crescimento da sua empresa
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { emoji: "🎯", name: "Posicionamento & Preço", desc: "Você está vendendo para o cliente certo, no preço certo?" },
          { emoji: "📢", name: "Geração de Demanda", desc: "Seu pipeline está cheio o suficiente para bater meta?" },
          { emoji: "⚡", name: "Eficiência em Vendas", desc: "Seu time converte bem e no tempo certo?" },
          { emoji: "🔄", name: "Expansão de Base", desc: "Você está extraindo o máximo dos clientes atuais?" },
        ].map((lever) => (
          <div
            key={lever.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "rgba(20, 28, 40, 0.04) 0px 4px 16px",
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{lever.emoji}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>
                {lever.name}
              </p>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                {lever.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#64748b",
          textAlign: "center",
          marginTop: 20,
          lineHeight: 1.5,
        }}
      >
        Agora vamos avaliar cada uma delas na sua empresa!
      </p>
    </Content>
  );
}

/* ============================================================
   BSSP IPRT Transition 1 — Social Proof + 4 Dimensions
   ============================================================ */
function BSSPTransition1({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#031D31", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
          +10.000 alunos
        </span>
        <br />
        <span style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>
          já passaram pela BSSP desde 2017
        </span>
      </div>

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
          boxShadow: "rgba(56,70,174,0.05) 0px 4px 9px, rgba(56,70,174,0.04) 0px 16px 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 100,
            padding: "18px 24px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
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
              color: "var(--text-on-dark)",
              lineHeight: 1.4,
            }}
          >
            A BSSP transformou a forma como encaro minha carreira na área tributária. O conteúdo é prático e direto ao ponto.
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
          Cliente A — Empresa X
        </span>
        <StarsSVG />
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", lineHeight: 1.5 }}>
          Referência em educação tributária desde 2017, a BSSP já formou milhares de profissionais com cursos reconhecidos pelo mercado e nota NPS acima de 93.
        </p>
      </div>
    </Content>
  );
}

/* ============================================================
   BSSP IPRT Transition 2 — Dimensions explanation
   ============================================================ */
function BSSPTransition2({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#031D31",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 24,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        As 4 dimensões que definem sua prontidão
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { emoji: "📖", name: "Domínio Normativo", desc: "Você conhece as novas regras — IBS, CBS, Split Payment, Simples Nacional?" },
          { emoji: "⚙️", name: "Aplicação Prática", desc: "Sabe traduzir as regras para a realidade dos clientes — contratos, preços, sistemas?" },
          { emoji: "🔧", name: "Preparação Operacional", desc: "Já está agindo — sistemas, processos, equipe, contratos?" },
          { emoji: "🔭", name: "Visão Estratégica", desc: "Enxerga as oportunidades de mercado que a Reforma cria, não só os riscos?" },
        ].map((dim) => (
          <div
            key={dim.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              background: "#fff",
              borderRadius: 15,
              boxShadow: "rgba(20, 28, 40, 0.04) 0px 4px 16px",
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{dim.emoji}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#031D31", margin: "0 0 4px" }}>
                {dim.name}
              </p>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                {dim.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#64748b",
          textAlign: "center",
          marginTop: 20,
          lineHeight: 1.5,
        }}
      >
        Agora vamos avaliar cada uma delas!
      </p>
    </Content>
  );
}

/* ============================================================
   BSSP IPRT Transition 3 — Chart social proof before Aplicação Prática
   ============================================================ */
function BSSPTransition3({ onContinue }: { onContinue: () => void }) {
  return (
    <Content onContinue={onContinue}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#031D31",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 24,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        Profissionais que se prepararam cedo
        capturam as melhores oportunidades
      </h2>

      {/* Chart */}
      <div
        style={{
          background: "#fff",
          borderRadius: 15,
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
            Preparo
          </text>

          {/* "COM ESPECIALIZAÇÃO" label */}
          <rect x="55" y="12" width="120" height="18" rx="4" fill="#031D31" />
          <text x="115" y="25" fontSize="8" fill="#fff" fontWeight="600" textAnchor="middle">
            COM ESPECIALIZAÇÃO
          </text>

          {/* Green line (with BSSP) */}
          <polyline
            points="60,155 120,140 180,115 240,80 300,45 360,25"
            fill="none"
            stroke="#1dbf73"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="60,155 120,140 180,115 240,80 300,45 360,25 360,180 60,180"
            fill="#1dbf73"
            opacity="0.12"
          />

          {/* "SEM ESPECIALIZAÇÃO" label */}
          <rect x="55" y="128" width="120" height="18" rx="4" fill="#e84343" />
          <text x="115" y="141" fontSize="8" fill="#fff" fontWeight="600" textAnchor="middle">
            SEM ESPECIALIZAÇÃO
          </text>

          {/* Red line (without BSSP) */}
          <polyline
            points="60,160 120,158 180,155 240,150 300,148 360,145"
            fill="none"
            stroke="#e84343"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="60,160 120,158 180,155 240,150 300,148 360,145 360,180 60,180"
            fill="#e84343"
            opacity="0.12"
          />

          {/* Dots */}
          <circle cx="240" cy="80" r="6" fill="#fff" stroke="#1dbf73" strokeWidth="2" />
          <circle cx="300" cy="148" r="6" fill="#fff" stroke="#e84343" strokeWidth="2" />

          {/* X-axis labels */}
          {["2026", "2027", "2028", "2029", "2030", "2033"].map((m, i) => (
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
            fontSize: 14,
            fontWeight: 400,
            textAlign: "center",
            color: "#161616",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Quem dominar as novas regras primeiro vai liderar a próxima geração de consultoria tributária no Brasil. A janela de oportunidade é agora.
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
          fontSize: 13,
          fontWeight: 400,
          textAlign: "center",
          color: "var(--text-on-dark-secondary)",
        }}
      >
        Cliente A — Empresa X
      </p>
    </Content>
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
    case "revenue-confianca-intro":
      return <RevenueConfiancaIntro onContinue={onContinue} />;
    case "revenue-social-proof-1":
      return <RevenueSocialProof1 onContinue={onContinue} />;
    case "revenue-social-proof-2":
      return <RevenueSocialProof2 onContinue={onContinue} />;
    case "revenue-social-proof-3":
      return <RevenueSocialProof3 onContinue={onContinue} />;
    case "revenue-social-proof-4":
      return <RevenueSocialProof4 onContinue={onContinue} />;
    case "revenue-social-proof-5":
      return <RevenueSocialProof5 onContinue={onContinue} />;
    // BSSP IPRT transitions
    case "bssp-social-proof":
      return <BSSPTransition1 onContinue={onContinue} />;
    case "bssp-dimensions":
      return <BSSPTransition2 onContinue={onContinue} />;
    case "bssp-aplicacao-intro":
      return <BSSPTransition3 onContinue={onContinue} />;
    default:
      return null;
  }
}
