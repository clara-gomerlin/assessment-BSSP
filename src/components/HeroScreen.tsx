"use client";

interface HeroScreenProps {
  quiz?: { settings?: { quiz_type?: string }; title?: string; description?: string };
  onStart: () => void;
}

export default function HeroScreen({ quiz, onStart }: HeroScreenProps) {
  const isDiagnostic = quiz?.settings?.quiz_type === "diagnostic";
  const isIPRT = quiz?.settings?.quiz_type === "iprt";

  if (isDiagnostic) {
    return <REIHero onStart={onStart} />;
  }

  if (isIPRT) {
    return <IPRTHero onStart={onStart} />;
  }

  // Fallback for other quiz types (archetype)
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <header style={{ padding: "16px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "var(--neutral-50)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--black-900)" }}>G</div>
          <span style={{ fontFamily: "var(--font-editorial)", fontWeight: 600, fontSize: 14, color: "var(--text-on-dark)" }}>Growth Leaders Academy</span>
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", paddingBottom: 100 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.75rem, 6vw, 2.5rem)", lineHeight: 1.15, color: "var(--neutral-50)", marginBottom: 24 }}>
            Diagnóstico<br />de Carreira
          </h1>
          <p style={{ fontSize: 15, color: "rgba(232,232,227,0.7)", lineHeight: 1.55, maxWidth: 400, margin: "0 auto" }}>
            Descubra seu arquétipo de carreira.
          </p>
        </div>
      </main>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px", background: "linear-gradient(to top, var(--bg-dark) 60%, transparent)" }}>
        <button onClick={onStart} className="continue-button" style={{ maxWidth: 540 }}>Começar</button>
      </div>
    </div>
  );
}

/* ============================================================
   IPRT Landing Page — BSSP brand, inspired by REI layout
   ============================================================ */
function IPRTHero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ background: "#031D31", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 64px", borderBottom: "1px solid rgba(255,255,255,0.06)", maxWidth: 1440, margin: "0 auto" }}>
        <img src="/logos/bssp-pos-graduacao-white.png" alt="BSSP Pós-Graduação" style={{ height: 36 }} />
      </nav>

      {/* Hero */}
      <section className="iprt-hero-grid" style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 64px 120px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "start" }}>
        {/* Left Column: Copy */}
        <div className="iprt-hero-copy" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* IPRT Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, animation: "fadeSlideUp 0.5s ease-out 0.1s both" }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(36px, 4vw, 52px)", color: "#ffffff", lineHeight: 1.1, letterSpacing: -0.5 }}>
              IPRT<span style={{ color: "#0ea5e9" }}>.</span>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 16, color: "#ffffff", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Índice de Prontidão para a Reforma Tributária
            </span>
          </div>

          {/* Sub-headline */}
          <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.25, color: "#ffffff", maxWidth: 580, animation: "fadeSlideUp 0.5s ease-out 0.2s both" }}>
            A Reforma Tributária já começou. Descubra se você está preparado — ou se há lacunas que podem custar caro.
          </h2>

          {/* Subtext */}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", maxWidth: 540, animation: "fadeSlideUp 0.5s ease-out 0.3s both" }}>
            A transição para o novo modelo tributário já é realidade. Profissionais que identificarem seus gaps agora vão liderar a próxima década. Os que esperarem vão competir com quem já se preparou.
          </p>

          {/* What you receive */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12, animation: "fadeSlideUp 0.5s ease-out 0.4s both" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "#ffffff", letterSpacing: 0.3 }}>
              Em 5 minutos, você descobre:
            </span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}>
              {[
                "Seu score de prontidão (0-100) com classificação do seu estágio",
                "Breakdown das 4 dimensões — Domínio Normativo, Aplicação Prática, Preparação Operacional e Visão Estratégica",
                "Sua maior lacuna identificada e o que ela significa na prática",
                "Análise personalizada com recomendações baseadas no seu perfil",
                "Módulos de especialização mais relevantes para o seu momento",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" }}>
                  <span style={{ color: "#0ea5e9", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop CTA */}
          <div className="iprt-desktop-cta" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, animation: "fadeSlideUp 0.5s ease-out 0.5s both" }}>
            <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#32373c", color: "white", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, padding: "14px 32px", border: "none", borderRadius: 9999, cursor: "pointer", transition: "all 0.3s ease", width: "fit-content", letterSpacing: 0.3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#052a42"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,42,66,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#32373c"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              DESCOBRIR MEU ÍNDICE
              <span style={{ fontSize: 16 }}>→</span>
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              100% gratuito. Ideal para contadores, advogados tributaristas e gestores.
            </span>
          </div>
        </div>

        {/* Right Column: Result preview card */}
        <div className="iprt-hero-preview" style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeSlideUp 0.6s ease-out 0.3s both" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(168,168,160,0.15)" }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Índice de Prontidão para a Reforma Tributária</span>
            </div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
              <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 90, height: 90 }}>
                  <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(168,168,160,0.15)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="39" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" strokeDasharray="245" strokeDashoffset="122" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 28, color: "#031D31", lineHeight: 1 }}>52</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#999" }}>%</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,165,0,0.08)", border: "1px solid rgba(255,165,0,0.2)", color: "#C47F17", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, padding: "4px 12px", borderRadius: 100, width: "fit-content" }}>⚠️ Em Construção</span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#666", lineHeight: 1.5 }}>Bom domínio dos fundamentos, mas lacunas na aplicação prática e preparação operacional.</p>
              </div>
            </div>

            {/* Dimension bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📜", name: "Domínio Normativo", score: 75, badge: "Consolidado", badgeColor: "#16a34a", barClass: "high" },
                { icon: "🔧", name: "Aplicação Prática", score: 35, badge: "Lacuna Crítica", badgeColor: "#dc2626", barClass: "low" },
                { icon: "⚙️", name: "Preparação Operacional", score: 42, badge: "Em Desenvolvimento", badgeColor: "#C47F17", barClass: "medium" },
                { icon: "🔭", name: "Visão Estratégica", score: 60, badge: "Em Desenvolvimento", badgeColor: "#C47F17", barClass: "medium" },
              ].map((dim) => (
                <div key={dim.name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "#031D31" }}>
                      <span style={{ fontSize: 13 }}>{dim.icon}</span>{dim.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="iprt-dimension-badge" style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: `${dim.badgeColor}10`, color: dim.badgeColor, border: `1px solid ${dim.badgeColor}33` }}>{dim.badge}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "#031D31" }}>{dim.score}%</span>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 5, background: "rgba(168,168,160,0.12)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${dim.score}%`, background: dim.barClass === "high" ? "#16a34a" : dim.barClass === "low" ? "#e84343" : "#f59e0b" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{ marginTop: 20, padding: 12, background: "rgba(232,68,68,0.04)", borderRadius: 8, borderLeft: "3px solid #e84343", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔴</span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#444", lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 600, color: "#031D31" }}>Lacuna identificada:</strong> Aplicação Prática (35%) mostra distância entre conhecer a lei e saber usar. Seus clientes vão cobrar a segunda.
              </p>
            </div>

            {/* Blur overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95))", pointerEvents: "none", zIndex: 2 }} />
          </div>

          {/* Social proof line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "4px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Baseado em pesquisa com profissionais tributários de todo o Brasil</span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="iprt-mobile-cta" style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 6, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px 10px", background: "#031D31", borderTop: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 -4px 20px rgba(0,0,0,0.4)" }}>
        <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#32373c", color: "white", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, padding: "14px 32px", border: "none", borderRadius: 9999, cursor: "pointer", width: "100%", letterSpacing: 0.3 }}>
          DESCOBRIR MEU ÍNDICE
          <span style={{ fontSize: 16 }}>→</span>
        </button>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>100% gratuito</span>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .iprt-hero-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 32px 120px !important;
            gap: 24px !important;
          }
          .iprt-hero-copy { display: contents !important; }
          .iprt-hero-preview { order: 4 !important; }
          .iprt-desktop-cta { display: none !important; }
          .iprt-mobile-cta { display: flex !important; }
          .iprt-dimension-badge { display: none !important; }
        }
        @media (max-width: 640px) {
          .iprt-hero-grid { padding: 32px 24px 120px !important; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   REI Landing Page — exact replica of rei-landing-page-v1.html
   ============================================================ */
function REIHero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 64px", borderBottom: "1px solid rgba(255,255,255,0.06)", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logos/gla-logo-white.webp" alt="Growth Leaders Academy" style={{ height: 32 }} />
        </div>
      </nav>

      {/* Hero */}
      <section className="rei-hero-grid" style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 64px 120px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "start" }}>
        {/* Left Column: Copy */}
        <div className="rei-hero-copy" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* REI Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, animation: "fadeSlideUp 0.5s ease-out 0.1s both" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(36px, 4vw, 52px)", color: "var(--neutral-50)", lineHeight: 1.1, letterSpacing: -0.5 }}>
              REI<span style={{ color: "var(--coral-on-dark)" }}>.</span>
            </div>
            <span style={{ fontFamily: "var(--font-editorial)", fontWeight: 500, fontSize: 16, color: "var(--neutral-50)", letterSpacing: 1.5, textTransform: "uppercase" }}>Revenue Efficiency Index</span>
          </div>

          {/* Sub-headline */}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.25, color: "var(--neutral-50)", maxWidth: 580, animation: "fadeSlideUp 0.5s ease-out 0.2s both" }}>
            Sua máquina de receita tem ineficiências que custam caro. Calcule seu REI e descubra onde.
          </h2>

          {/* Subtext */}
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65, color: "rgba(232,232,227,0.7)", maxWidth: 540, animation: "fadeSlideUp 0.5s ease-out 0.3s both" }}>
            Absolutamente toda empresa tem ineficiências escondidas em pelo menos uma das 4 alavancas de receita. A pergunta não é &quot;se&quot;, é &quot;onde&quot;.
          </p>

          {/* What you receive */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12, animation: "fadeSlideUp 0.5s ease-out 0.4s both" }}>
            <span style={{ fontFamily: "var(--font-editorial)", fontWeight: 700, fontSize: 14, color: "var(--text-on-dark)", letterSpacing: 0.3 }}>Em 8 minutos, você recebe:</span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}>
              {[
                "Score de eficiência (0-100) com classificação do seu estágio",
                "Breakdown das 4 alavancas — qual está forte, qual está travando",
                "Sinais de alerta que indicam onde há vazamento de receita",
                "Análise de impacto — por que isso importa para o seu momento",
                "3 ações para esta semana — baseadas no seu ponto cego",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--text-on-dark)" }}>
                  <span style={{ color: "var(--coral-on-dark)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop CTA */}
          <div className="rei-desktop-cta" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, animation: "fadeSlideUp 0.5s ease-out 0.5s both" }}>
            <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--coral-500)", color: "white", fontFamily: "var(--font-editorial)", fontWeight: 700, fontSize: 15, padding: "14px 32px", border: "none", borderRadius: 8, cursor: "pointer", transition: "all 0.3s ease", width: "fit-content", letterSpacing: 0.3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--coral-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,111,97,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--coral-500)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              DESCOBRIR INEFICIÊNCIAS
              <span style={{ fontSize: 16 }}>→</span>
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(232,232,227,0.65)" }}>
              100% gratuito. Ideal para fundadores e C-level de empresas B2B ou B2C com venda complexa.
            </span>
          </div>
        </div>

        {/* Right Column: Result preview card */}
        <div className="rei-hero-preview" style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeSlideUp 0.6s ease-out 0.3s both" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(168,168,160,0.15)" }}>
              <span style={{ fontFamily: "var(--font-editorial)", fontWeight: 600, fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Revenue Efficiency Index</span>
            </div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
              <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 90, height: 90 }}>
                  <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(168,168,160,0.15)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="39" fill="none" stroke="var(--coral-500)" strokeWidth="8" strokeLinecap="round" strokeDasharray="245" strokeDashoffset="98" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--black-900)", lineHeight: 1 }}>60</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#999" }}>/100</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,165,0,0.08)", border: "1px solid rgba(255,165,0,0.2)", color: "#C47F17", fontFamily: "var(--font-editorial)", fontWeight: 600, fontSize: 12, padding: "4px 12px", borderRadius: 100, width: "fit-content" }}>⚠️ Crescimento Desequilibrado</span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#666", lineHeight: 1.5 }}>Sua empresa cresce, mas com alavancas desiguais — há receita que não está sendo capturada.</p>
              </div>
            </div>

            {/* Dimension bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🎯", name: "Posicionamento & Preço", score: 85, badge: "Alavanca Ativa", badgeColor: "#16a34a", barClass: "high" },
                { icon: "🔥", name: "Geração de Demanda", score: 29, badge: "Ponto Cego", badgeColor: "#dc2626", barClass: "low" },
                { icon: "⚡", name: "Eficiência em Vendas", score: 68, badge: "Alavanca Ativa", badgeColor: "#16a34a", barClass: "high" },
                { icon: "📈", name: "Expansão de Base", score: 58, badge: "Em Desenvolvimento", badgeColor: "#C47F17", barClass: "medium" },
              ].map((dim) => (
                <div key={dim.name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-editorial)", fontWeight: 600, fontSize: 13, color: "var(--black-900)" }}>
                      <span style={{ fontSize: 13 }}>{dim.icon}</span>{dim.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="rei-dimension-badge" style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: `${dim.badgeColor}10`, color: dim.badgeColor, border: `1px solid ${dim.badgeColor}33` }}>{dim.badge}</span>
                      <span style={{ fontFamily: "var(--font-editorial)", fontWeight: 700, fontSize: 13, color: "var(--black-900)" }}>{dim.score}/100</span>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 5, background: "rgba(168,168,160,0.12)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${dim.score}%`, background: dim.barClass === "high" ? "#16a34a" : dim.barClass === "low" ? "var(--coral-500)" : "#f59e0b" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{ marginTop: 20, padding: 12, background: "rgba(255,111,97,0.04)", borderRadius: 8, borderLeft: "3px solid var(--coral-500)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔴</span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#444", lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 600, color: "var(--black-900)" }}>Ponto cego identificado:</strong> Geração de Demanda (29/100) está travando o potencial das outras alavancas. Destravar essa dimensão pode representar 30-40% de receita adicional.
              </p>
            </div>

            {/* Blur overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95))", pointerEvents: "none", zIndex: 2 }} />
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "4px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-on-dark-secondary)", fontWeight: 500 }}>Baseado na experiência do GLA ao ajudar no crescimento de +200 empresas</span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Client logos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "4px 0", marginBottom: 80 }}>
            {[
              { src: "/logos/clients/onfly.png", alt: "Onfly", mh: 50 },
              { src: "/logos/clients/wellhub.png", alt: "Wellhub", mh: 45 },
              { src: "/logos/clients/serasa.png", alt: "Serasa", mh: 63 },
              { src: "/logos/clients/caffeine-army.png", alt: "Caffeine Army", mh: 100 },
              { src: "/logos/clients/conta-simples.png", alt: "Conta Simples", mh: 80 },
              { src: "/logos/clients/omie.png", alt: "Omie", mh: 50 },
            ].map((logo) => (
              <div key={logo.alt} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={logo.src} alt={logo.alt} className="client-logo-img" style={{ "--logo-h": `${logo.mh}px` } as React.CSSProperties} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="rei-mobile-cta" style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 6, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px 10px", background: "var(--bg-dark)", borderTop: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 -4px 20px rgba(0,0,0,0.4)" }}>
        <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--coral-500)", color: "white", fontFamily: "var(--font-editorial)", fontWeight: 700, fontSize: 13, padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", width: "100%", letterSpacing: 0.3 }}>
          DESCOBRIR INEFICIÊNCIAS
          <span style={{ fontSize: 14 }}>→</span>
        </button>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(232,232,227,0.5)" }}>100% gratuito</span>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .rei-hero-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 32px 120px !important;
            gap: 24px !important;
          }
          .rei-hero-copy { display: contents !important; }
          .rei-hero-preview { order: 4 !important; }
          .rei-desktop-cta { display: none !important; }
          .rei-mobile-cta { display: flex !important; }
          .rei-dimension-badge { display: none !important; }
        }
        @media (max-width: 640px) {
          .rei-hero-grid { padding: 32px 24px 120px !important; }
        }
      `}</style>
    </div>
  );
}
