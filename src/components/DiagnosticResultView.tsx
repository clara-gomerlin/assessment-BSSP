"use client";

import { useCallback, useState } from "react";
import { DimensionResult } from "@/lib/types";

interface DiagnosticResultViewProps {
  result: {
    type: "meta";
    scoreGeral: number;
    scoreGeralLabel: string;
    scoreGeralColor: string;
    dimensions: DimensionResult[];
    strongest: DimensionResult;
    weakest: DimensionResult;
    qualification: {
      faturamento: string;
      papel: string;
      emocionalTags: string[];
      crm: string;
    };
    confidenceScore?: number;
    confidenceLabel?: string;
    confidenceColor?: string;
  };
  analysis: unknown;
  markdown: string;
  respondentName: string;
  quizSlug: string;
  quizId?: string;
  responseId?: string | null;
  respondentEmail?: string;
  ctaWhatsappUrl?: string;
  hubspotContactId?: string | null;
  quizTitle?: string;
  utmParams?: Record<string, string>;
}

const DEFAULT_WHATSAPP_URL = "https://wa.me/5511932727443?text=Ol%C3%A1%2C%20recebi%20meu%20diagn%C3%B3stico%20de%20receita%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20consultoria%20do%20GLA.";

// ============================================================
// V3 Texts
// ============================================================
const SCORE_GERAL_TEXTS: Record<string, string> = {
  "Na Armadilha": "Você investe mais, contrata mais, gasta mais — mas cresce menos do que crescia antes. E a sensação de que algo está errado, sem saber exatamente onde, só aumenta. Isso tem nome: Armadilha do Crescimento.",
  "Crescimento Vulnerável": "Sua empresa cresceu na raça e com mérito. Mas sem método. E cada decisão rápida que fez sentido no momento criou um passivo — débito de crescimento — que agora está cobrando juros. Sua máquina funciona, mas foi remendada.",
  "Crescimento Desequilibrado": "Você é forte em 1-2 alavancas, mas negligencia as outras. E o padrão que mais vemos é justamente esse: a empresa investe pesado onde já sabe operar e ignora as alavancas que teriam retorno mais assimétrico com menos esforço.",
  "Crescimento Eficiente": "Sua máquina de receita não foi remendada — foi projetada. Você opera as 4 alavancas com consistência e tem visibilidade real do que funciona. Menos de 12% das empresas que diagnosticamos chegam aqui.",
};

const WEAKEST_TEXTS: Record<string, { title: string; paragraphs: string[] }> = {
  PP: {
    title: "Sua alavanca mais negligenciada é Posicionamento & Preço.",
    paragraphs: [
      "Estratégia de preço é a alavanca mais subvalorizada de qualquer negócio. E também a mais poderosa.",
      "Uma pesquisa da McKinsey com empresas do S&P 1500 mostrou que 1% de melhoria em pricing gera 11% de aumento em lucro operacional. Pra comparar: 1% de redução de custo gera 7.8%. E 1% de aumento em volume gera 3.3%.",
      "Ainda assim, 85% de 1.700 empresas B2B admitem que suas decisões de pricing podem melhorar (HBR/Bain). E 40% das empresas SaaS não revisitaram pricing nos últimos 18 meses (OpenView).",
    ],
  },
  GD: {
    title: "Sua alavanca mais negligenciada é Geração de Demanda.",
    paragraphs: [
      "Geração de demanda é quase sempre o centro percebido do problema. \"Precisamos de mais leads\" é o reflexo padrão. Mas na maioria dos casos, o problema não é volume — é visibilidade do que funciona.",
      "O custo de anúncios sempre vai subir. Custos de Meta Ads subiram 14% enquanto impressões subiram só 6% — você paga mais pra mostrar menos.",
      "O resultado é o Marketing Caixa Preta: dinheiro entra, algum resultado sai, mas ninguém consegue explicar a relação entre os dois. E quando marketing e vendas não falam a mesma língua, 41% dos leads gerados são imediatamente descartados por vendas (SalesGlobe).",
    ],
  },
  EV: {
    title: "Sua alavanca mais negligenciada é Eficiência em Vendas.",
    paragraphs: [
      "As empresas são obcecadas com o que entra no CRM e o que sai. Mas o que acontece no meio do caminho? Caos.",
      "Nos diagnósticos que fizemos: 90%+ das empresas têm dinheiro parado no CRM. 70%+ perdem bons deals por problemas simples de processo. 25-40% do pipeline é maquiagem — deal morto fingindo que existe.",
      "A maior conclusão: os melhores vendedores brilham APESAR do processo de vendas, não por causa dele. Enquanto tem deal parado, marketing sofre pressão pra gerar mais demanda. Não é um problema de geração. É um problema de vazamento invisível.",
    ],
  },
  EB: {
    title: "Sua alavanca mais negligenciada é Expansão de Base de Clientes.",
    paragraphs: [
      "Essa é a alavanca mais subaproveitada. Quase nenhuma empresa tem um mecanismo real pra vender mais pra própria base de clientes.",
      "A taxa de conversão pra vender pra um cliente existente é 5-10x maior que pra um novo. Em empresas de $50M-100M, a receita de expansão já representa 58% do novo ARR (Benchmarkit).",
      "O impacto em valuation é direto: empresas no top quartile de NRR são avaliadas a 24x a receita. As do bottom: 5x. Mesma receita, quase 5x de diferença em valor (McKinsey).",
    ],
  },
};

const GAP_TENSION_TEXTS: Record<string, string> = {
  armadilha_do_mais: "Você disse que investe mais mas o retorno não acompanha. Isso é a Armadilha do Crescimento — e é mais comum do que parece. Um estudo com 600+ empresas ao longo de 50 anos (HBR) mostrou que 87% das estagnações de crescimento foram causadas por decisões internas. O próximo salto de receita está dentro de casa.",
  refem: "Você depende de poucos canais ou poucas pessoas para gerar receita. É a esteira: corre cada vez mais rápido pra ficar no mesmo lugar. A boa notícia: existem alavancas de receita que não dependem de mídia paga.",
  dados_frageis: "Você disse que não confia nos dados para decidir. Quando a operação de receita é uma caixa preta, cada decisão de crescimento vira instinto. Quem está no topo estima perda de 16% por vazamento de receita. Quem está perto da operação mede 26% (Clari).",
  sem_plano: "Você não tem um plano de crescimento claro para os próximos 12 meses. As lideranças ficam afogadas em execução — não sobra tempo pra analisar onde está a oportunidade.",
  invisibilidade: "Você sente que tem oportunidade, mas não consegue priorizar o que atacar. O problema não é falta de opção — é excesso de frentes sem critério para priorizar.",
  lideranca_fragil: "Você sente que sua liderança não está preparada para o próximo salto. O gap aqui é de execução e capacidade de imprimir ritmo.",
};
const GAP_PRIORITY = ["armadilha_do_mais", "refem", "dados_frageis", "sem_plano", "invisibilidade", "lideranca_fragil"];

function getBarColor(score: number): string {
  if (score >= 67) return "#16a34a";
  if (score >= 34) return "#f59e0b";
  return "#FF6F61";
}

function getBadgeClass(label: string): string {
  if (label === "Alavanca Ativa") return "active";
  if (label === "Em Desenvolvimento") return "developing";
  return "blind";
}

function getBadgeColor(label: string): { bg: string; color: string; border: string } {
  if (label === "Alavanca Ativa") return { bg: "rgba(34,197,94,0.12)", color: "#f59e0b", border: "rgba(255,165,0,0.25)" };
  if (label === "Na Armadilha") return { bg: "rgba(239,68,68,0.12)", color: "#dc2626", border: "rgba(239,68,68,0.25)" };
  if (label === "Crescimento Vulnerável") return { bg: "rgba(255,165,0,0.12)", color: "#f59e0b", border: "rgba(255,165,0,0.25)" };
  if (label === "Crescimento Desequilibrado") return { bg: "rgba(255,165,0,0.12)", color: "#f59e0b", border: "rgba(255,165,0,0.25)" };
  return { bg: "rgba(34,197,94,0.12)", color: "#16a34a", border: "rgba(34,197,94,0.25)" };
}

// ============================================================
// Main Component
// ============================================================
export default function DiagnosticResultView({
  result,
  respondentName,
  quizId,
  responseId,
  respondentEmail,
  ctaWhatsappUrl,
  hubspotContactId,
  quizTitle,
  utmParams,
}: DiagnosticResultViewProps) {
  const firstName = respondentName.split(" ")[0] || "Empresa";
  const [dealCreated, setDealCreated] = useState(false);

  const handleCtaClick = useCallback(() => {
    if (dealCreated || !hubspotContactId) return;
    setDealCreated(true);
    fetch("/api/quiz/create-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hubspot_contact_id: hubspotContactId,
        contact_name: respondentName,
        contact_email: respondentEmail,
        quiz_title: quizTitle || "Quiz",
        quiz_id: quizId,
        response_id: responseId,
        utm_params: utmParams && Object.keys(utmParams).length > 0 ? utmParams : undefined,
      }),
    }).catch((err) => console.error("Deal creation error:", err));
  }, [hubspotContactId, respondentName, respondentEmail, quizTitle, quizId, responseId, dealCreated, utmParams]);

  const scoreText = SCORE_GERAL_TEXTS[result.scoreGeralLabel] || "";
  const weakest = WEAKEST_TEXTS[result.weakest.code];
  const topTag = GAP_PRIORITY.find((t) => (result.qualification?.emocionalTags || []).includes(t));
  const gapText = topTag ? GAP_TENSION_TEXTS[topTag] : null;
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (circumference * result.scoreGeral) / 100;
  const badgeColors = getBadgeColor(result.scoreGeralLabel);
  const ctaUrl = ctaWhatsappUrl || DEFAULT_WHATSAPP_URL;

  return (
    <div className="rei-result-page">
      {/* Navbar */}
      <nav className="rei-navbar">
        <img src="/logos/gla-logo-white.webp" alt="Growth Leaders Academy" style={{ height: 32 }} />
      </nav>

      {/* Hero Score */}
      <section className="rei-hero-score">
        <p className="rei-hero-greeting"><strong>{firstName}</strong>, aqui está o seu <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>REI.</span></p>
        <h1 className="rei-hero-title">Revenue Efficiency Index<span style={{ color: "var(--coral-on-dark)" }}>.</span></h1>

        <div className="rei-score-display">
          <div className="rei-score-circle">
            <svg viewBox="0 0 150 150">
              <circle className="track" cx="75" cy="75" r="65" />
              <circle className="progress" cx="75" cy="75" r="65" style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
            </svg>
            <div className="rei-score-value">
              <div className="rei-score-number">{result.scoreGeral}</div>
              <div className="rei-score-total">/100</div>
            </div>
          </div>

          <span className="rei-score-badge" style={{ background: badgeColors.bg, border: `1px solid ${badgeColors.border}`, color: badgeColors.color }}>
            {result.scoreGeralLabel}
          </span>

          {scoreText && <p className="rei-score-desc">{scoreText}</p>}
        </div>
      </section>

      {/* 2-Column Content */}
      <div className="rei-content-wrapper">
        <div className="rei-content-main">

          {/* Breakdown */}
          <div className="rei-section-card">
            <h2 className="rei-section-title">Breakdown por Alavanca</h2>
            {result.dimensions.map((dim) => (
              <div key={dim.code} className="rei-breakdown-row">
                <div className="rei-breakdown-header">
                  <span className="rei-dim-name">
                    <span>{dim.emoji}</span>{dim.name}
                  </span>
                  <div className="rei-dim-meta">
                    <span className={`rei-dim-badge ${getBadgeClass(dim.label)}`}>{dim.label}</span>
                    <span className="rei-dim-score">{dim.normalizedScore}/100</span>
                  </div>
                </div>
                <div className="rei-bar">
                  <div className="rei-bar-fill" style={{ width: `${dim.normalizedScore}%`, background: getBarColor(dim.normalizedScore) }} />
                </div>
              </div>
            ))}
            <div className="rei-highlights">
              <div className="rei-highlight strongest">
                <div className="rei-highlight-label">Mais forte</div>
                <div className="rei-highlight-dim">{result.strongest.emoji} {result.strongest.name}</div>
                <div className="rei-highlight-score">{result.strongest.normalizedScore}/100</div>
              </div>
              <div className="rei-highlight weakest">
                <div className="rei-highlight-label">Mais fraca</div>
                <div className="rei-highlight-dim">{result.weakest.emoji} {result.weakest.name}</div>
                <div className="rei-highlight-score">{result.weakest.normalizedScore}/100</div>
              </div>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="rei-cta-mobile">
            <div className="rei-cta-card">
              <span style={{ fontSize: 28 }}>🚀</span>
              <h3 className="rei-cta-card-title">Saber onde dói é apenas metade do caminho.</h3>
              <p className="rei-cta-card-text">O GLA entra na sua operação para corrigir as alavancas que estão travando receita.</p>
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="rei-cta-button" onClick={handleCtaClick}>
                FALAR COM O TIME <span>→</span>
              </a>
            </div>
          </div>

          {/* Alavanca mais fraca */}
          {weakest && (
            <div className="rei-analysis-card danger">
              <div className="rei-analysis-header">
                <span style={{ fontSize: 20 }}>🔴</span>
                <span className="rei-analysis-title">Alavanca mais negligenciada</span>
              </div>
              <h3 className="rei-analysis-dim-title">{result.weakest.emoji} {result.weakest.name} — {result.weakest.normalizedScore}/100</h3>
              {weakest.paragraphs.map((p, i) => (
                <p key={i} className="rei-analysis-text">{p}</p>
              ))}
            </div>
          )}

          {/* Gap Tension */}
          {gapText && (
            <div className="rei-analysis-card alert">
              <div className="rei-analysis-header">
                <span style={{ fontSize: 20 }}>💡</span>
                <span className="rei-analysis-title">O que isso significa pra você</span>
              </div>
              <p className="rei-analysis-text">{gapText}</p>
            </div>
          )}

          {/* Framework Education */}
          <div className="rei-analysis-card info">
            <div className="rei-analysis-header">
              <span style={{ fontSize: 20 }}>📊</span>
              <span className="rei-analysis-title">O Framework das 4 Alavancas</span>
            </div>
            <p className="rei-analysis-text"><strong style={{ color: "var(--text-primary)" }}>Quando o crescimento desacelera, a reação natural é: investir mais.</strong> Mais ads, mais leads, mais vendedores. Só que as regras do jogo mudaram. A eficiência de crescimento caiu ~50% entre 2021 e 2023 (McKinsey).</p>
            <p className="rei-analysis-text">Antes de investir mais lá fora, existem 4 alavancas subaproveitadas:</p>
            <p className="rei-analysis-text">
              <strong>1. Posicionamento & Preço</strong> — quanto valor você captura do que já entrega<br />
              <strong>2. Geração de Demanda</strong> — de onde vêm seus leads e quanto custa cada um<br />
              <strong>3. Eficiência em Vendas</strong> — quanto do seu pipeline vira receita de verdade<br />
              <strong>4. Expansão de Base</strong> — quanto seus clientes atuais geram de receita nova
            </p>
            <p className="rei-analysis-text">Em todas as empresas que diagnosticamos, encontramos receita escondida em pelo menos uma dessas alavancas. A pergunta não é SE. É ONDE.</p>
          </div>

        </div>

        {/* Sticky CTA Sidebar */}
        <div className="rei-cta-sidebar">
          <div className="rei-cta-card">
            <span style={{ fontSize: 28 }}>🚀</span>
            <h3 className="rei-cta-card-title">Saber onde dói é apenas metade do caminho.</h3>
            <p className="rei-cta-card-text">O GLA entra na sua operação para corrigir as alavancas que estão travando receita.</p>
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="rei-cta-button" onClick={handleCtaClick}>
              FALAR COM O TIME <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rei-bottom-cta">
        <div className="rei-bottom-cta-inner">
          <div>
            <h2 className="rei-bottom-cta-title">Saber onde está travado é o primeiro passo. O segundo leva 45 minutos.</h2>
            <p className="rei-bottom-cta-text">Um especialista do GLA analisa seus resultados, aprofunda nas análises e cruza com o contexto da sua operação — e te mostra exatamente qual alavanca priorizar.</p>
            <ul className="rei-bottom-list" style={{ listStyle: "none", padding: 0 }}>
              <li><span style={{ color: "var(--coral-on-dark)" }}>✦</span> Diagnóstico contextualizado: o que o assessment não captura sozinho</li>
              <li><span style={{ color: "var(--coral-on-dark)" }}>✦</span> Uma prioridade clara para o seu momento e recursos</li>
              <li><span style={{ color: "var(--coral-on-dark)" }}>✦</span> Próximo passo concreto — não uma lista genérica</li>
            </ul>
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="rei-cta-button" onClick={handleCtaClick} style={{ width: "fit-content", padding: "16px 36px", fontSize: 15, marginTop: 24 }}>
              AGENDAR CONVERSA <span>→</span>
            </a>
          </div>

          {/* Testimonial */}
          <div className="rei-testimonial">
            <p className="rei-testimonial-quote">
              &ldquo;Éramos monoproduto e 100% dependentes de ads. O Mineiro identificou que a maior alavanca de crescimento estava escondida na nossa própria base de clientes. Entendemos nossa base, aumentamos nosso portfólio de produtos e voltamos a crescer 100% ao ano.&rdquo;
            </p>
            <div className="rei-testimonial-author">
              <div className="rei-testimonial-avatar">EW</div>
              <div>
                <div className="rei-testimonial-name">Eduardo Wünsch</div>
                <div className="rei-testimonial-role">Fundador, Jouse</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
