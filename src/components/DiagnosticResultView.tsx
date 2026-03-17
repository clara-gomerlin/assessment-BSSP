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
// SEÇÃO 1 — Textos do Score Geral
// ============================================================
const SCORE_GERAL_TEXTS: Record<string, string> = {
  "Na Armadilha": "Você investe mais, contrata mais, gasta mais — mas cresce menos do que crescia antes. E a sensação de que algo está errado, sem saber exatamente onde, só aumenta. Isso tem nome: Armadilha do Crescimento.",
  "Crescimento Vulnerável": "Sua empresa cresceu na raça e com mérito. Mas sem método. E cada decisão rápida que fez sentido no momento criou um passivo — débito de crescimento — que agora está cobrando juros. Sua máquina funciona, mas foi remendada.",
  "Crescimento Desequilibrado": "Você é forte em 1-2 alavancas, mas negligencia as outras. E o padrão que mais vemos é justamente esse: a empresa investe pesado onde já sabe operar e ignora as alavancas que teriam retorno mais assimétrico com menos esforço. O próximo salto de receita provavelmente não está onde você já olha.",
  "Crescimento Eficiente": "Sua máquina de receita não foi remendada — foi projetada. Você opera as 4 alavancas com consistência e tem visibilidade real do que funciona. Menos de 12% das empresas que diagnosticamos chegam aqui.",
};

// ============================================================
// SEÇÃO 2 — Textos por label de dimensão
// ============================================================
const DIMENSION_LABEL_TEXTS: Record<string, string> = {
  "Ponto Cego": "Ponto Cego — essa alavanca é invisível na sua operação. Tem receita aqui que ninguém está olhando. E sem visibilidade, você nem sabe o tamanho do problema.",
  "Em Desenvolvimento": "Em Desenvolvimento — você sabe que isso importa, mas a execução depende de quem puxa, não de processo. Funciona quando alguém lembra. Para quando essa pessoa se distrai.",
  "Alavanca Ativa": "Alavanca Ativa — aqui, sua máquina foi projetada. Tem processo, tem dado, tem resultado mensurável.",
};

// ============================================================
// SEÇÃO 3 — Textos da alavanca mais negligenciada
// ============================================================
const WEAKEST_DIMENSION_TEXTS: Record<string, { title: string; text: string }> = {
  PP: {
    title: "Sua alavanca mais negligenciada é Posicionamento & Preço.",
    text: "Estratégia de preço é a alavanca mais subvalorizada de qualquer negócio. E também a mais poderosa.\n\nUma pesquisa da McKinsey com empresas do S&P 1500 mostrou que 1% de melhoria em pricing gera 11% de aumento em lucro operacional. Pra comparar: 1% de redução de custo gera 7.8%. E 1% de aumento em volume gera 3.3%. Pricing é 3-4x mais alavancado que qualquer outra ação que você pode tomar.\n\nAinda assim, 85% de 1.700 empresas B2B admitem que suas decisões de pricing podem melhorar (HBR/Bain). E 40% das empresas SaaS não revisitaram pricing nos últimos 18 meses (OpenView).",
  },
  GD: {
    title: "Sua alavanca mais negligenciada é Geração de Demanda.",
    text: "Geração de demanda é quase sempre o centro percebido do problema. \"Precisamos de mais leads\" é o reflexo padrão. Na dúvida? Gera mais leads. Mas na maioria dos casos, o problema não é volume — é visibilidade do que funciona.\n\nO custo de anúncios, por lógica, sempre vai subir. Mais empresas competindo no leilão, a plataforma otimizada pro lucro dela, não pro seu. Custos de Meta Ads subiram 14% enquanto impressões subiram só 6% — você paga mais pra mostrar menos.\n\nO resultado é o Marketing Caixa Preta: dinheiro entra, algum resultado sai, mas ninguém consegue explicar a relação entre os dois. E quando marketing e vendas não falam a mesma língua, 41% dos leads gerados são imediatamente descartados por vendas (SalesGlobe).",
  },
  EV: {
    title: "Sua alavanca mais negligenciada é Eficiência em Vendas.",
    text: "As empresas são obcecadas com o que entra no CRM e o que sai. Mas o que acontece no meio do caminho? Caos.\n\nNos diagnósticos que fizemos no último ano: 90%+ das empresas têm dinheiro parado no CRM — oportunidades abandonadas, leads sem dono, deals que ninguém mais trabalha. 70%+ perdem bons deals por problemas simples de processo. 25-40% do pipeline é maquiagem — deal morto fingindo que existe, atrapalhando o forecast e distraindo o vendedor do que importa.\n\nA maior conclusão: os melhores vendedores brilham APESAR do processo de vendas, não por causa dele. E enquanto tem deal parado, marketing sofre pressão pra gerar mais demanda. Não é um problema de geração. É um problema de vazamento invisível.",
  },
  EB: {
    title: "Sua alavanca mais negligenciada é Expansão de Base de Clientes.",
    text: "Essa é a alavanca mais subaproveitada. Quase nenhuma empresa tem um mecanismo real pra vender mais pra própria base de clientes.\n\nA taxa de conversão pra vender pra um cliente existente é 5-10x maior que pra um novo. Em empresas de $50M-100M, a receita de expansão já representa 58% do novo ARR. Nas de $100M+, chega a 67% (Benchmarkit). Quanto maior a empresa, mais ela cresce pela base de clientes — não por novos clientes.\n\nE o impacto em valuation é direto: empresas no top quartile de NRR são avaliadas a 24x a receita. As do bottom: 5x. Mesma receita, quase 5x de diferença em valor (McKinsey). A diferença é quanto vem de dentro versus quanto precisa vir de fora.",
  },
};

// ============================================================
// Score de Confiança — textos
// ============================================================
const CONFIDENCE_TEXTS: Record<string, string> = {
  "Voando no Escuro": "Suas decisões de crescimento são baseadas em instinto, não em dados. E o instinto sob pressão faz o oposto do que deveria: estreita as opções e te leva a dobrar a aposta no que já conhece (threat rigidity, Barry Staw — UC Berkeley). Sem dados, cada decisão é uma aposta.",
  "Visão Parcial": "Você tem uma noção do que acontece, mas precisa juntar dados de várias fontes na mão — e quando a análise fica pronta, a janela de ação já passou.",
  "Visão Razoável": "Você responde a maioria das perguntas, mas sem a velocidade e o detalhe que decisão real exige. É a operação de receita como caixa preta em versão leve: tem uma ideia do resultado, mas não consegue explicar o porquê.",
  "Painel de Controle": "Você responde rápido, com dados, e sabe onde olhar pra tomar cada decisão. Menos de 15% dos líderes que diagnosticamos operam nesse nível. Sua máquina não é uma caixa preta.",
};

// ============================================================
// SEÇÃO 5 — Gap Tension por tags Q4
// ============================================================
const GAP_TENSION_TEXTS: Record<string, string> = {
  armadilha_do_mais: "Você disse que investe mais mas o retorno não acompanha. Isso é a Armadilha do Crescimento — e é mais comum do que parece. Um estudo com 600+ empresas ao longo de 50 anos (HBR) mostrou que 87% das estagnações de crescimento foram causadas por decisões internas. Pricing que nunca revisitou. Processo de vendas na base do vendedor herói. Base de clientes que nunca trabalhou de forma estruturada. O inimigo não é o mercado. O próximo salto de receita está dentro de casa.",
  refem: "Você depende de poucos canais ou poucas pessoas para gerar receita. É a esteira: corre cada vez mais rápido pra ficar no mesmo lugar. O custo de anúncios sempre vai subir — mais competição no leilão, plataforma otimizada pro lucro dela, não pro seu. A boa notícia: existem alavancas de receita que não dependem de mídia paga. E a maioria das empresas B2B nem sabe que existem.",
  dados_frageis: "Você disse que não confia nos dados para decidir. Quando a operação de receita é uma caixa preta — dinheiro entra, algum resultado sai, ninguém explica a relação — cada decisão de crescimento vira instinto. E o instinto sob pressão faz o oposto do que deveria: estreita as opções e dobra a aposta no que já conhece. Quem está no topo estima perda de 16% por vazamento de receita. Quem está perto da operação mede 26% (Clari). A diferença entre achar e saber é onde mora o risco.",
  sem_plano: "Você não tem um plano de crescimento claro para os próximos 12 meses. As lideranças ficam afogadas em execução — não sobra tempo pra analisar onde está a oportunidade. E o que precisa ser feito exige uma combinação rara: visão de negócio, domínio de dados, conhecimento de canais, estrutura de CRM e capacidade de imprimir ritmo. É raro ter tudo isso numa pessoa. E mais raro ainda ter tempo pra implementar.",
  invisibilidade: "Você sente que tem oportunidade, mas não consegue priorizar o que atacar. O problema geralmente não é falta de opção — é excesso de frentes sem critério para priorizar.",
  lideranca_fragil: "Você sente que sua liderança não está preparada para o próximo salto. O gap aqui é de execução e capacidade de imprimir ritmo.",
};
const GAP_TENSION_PRIORITY = ["armadilha_do_mais", "refem", "dados_frageis", "sem_plano", "invisibilidade", "lideranca_fragil"];

// ============================================================
// Helper: get top priority gap tension tag
// ============================================================
function getTopGapTension(tags: string[]): string | null {
  for (const priority of GAP_TENSION_PRIORITY) {
    if (tags.includes(priority)) return priority;
  }
  return null;
}

// ============================================================
// Helper: check if faturamento is <R$5M (Q1 first option)
// ============================================================
function isSmallRevenue(faturamento: string): boolean {
  return faturamento.toLowerCase().includes("até r$5") || faturamento.toLowerCase().includes("menos de") || faturamento.toLowerCase().includes("r$ 5");
}

// ============================================================
// Section Card Component
// ============================================================
function SectionCard({ icon, title, children, borderColor }: { icon: string; title: string; children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{ padding: "20px", borderRadius: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "rgba(20,28,40,0.06) 0 8px 24px", borderLeft: borderColor ? `4px solid ${borderColor}` : undefined, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
      </div>
      <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// ============================================================
// Dimension Bar
// ============================================================
function DimensionBar({ dim, animDelay }: { dim: DimensionResult; animDelay: number }) {
  return (
    <div style={{ opacity: 0, animation: "fadeUp 0.5s ease forwards", animationDelay: `${animDelay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{dim.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{dim.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="diagnostic-status-pill" style={{ color: dim.color, background: `${dim.color}18`, borderColor: `${dim.color}40` }}>{dim.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", minWidth: 48, textAlign: "right" }}>{dim.normalizedScore}/100</span>
        </div>
      </div>
      <div className="diagnostic-bar-track">
        <div className="diagnostic-bar-fill" style={{ width: `${dim.normalizedScore}%`, background: dim.color, animationDelay: `${animDelay + 0.3}s` }} />
      </div>
    </div>
  );
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

  // Derived data
  const scoreGeralText = SCORE_GERAL_TEXTS[result.scoreGeralLabel] || "";
  const weakestContent = WEAKEST_DIMENSION_TEXTS[result.weakest.code];
  const confidenceScore = result.confidenceScore ?? 0;
  const confidenceLabel = result.confidenceLabel || "Visão Parcial";
  const confidenceColor = result.confidenceColor || "#f5a623";
  const confidenceText = CONFIDENCE_TEXTS[confidenceLabel] || "";
  const topTag = getTopGapTension(result.qualification?.emocionalTags || []);
  const gapTensionText = topTag ? GAP_TENSION_TEXTS[topTag] : null;
  const showSection3B = confidenceScore <= 30 && result.weakest.normalizedScore <= 33;
  const smallRevenue = isSmallRevenue(result.qualification?.faturamento || "");

  return (
    <div style={{ width: "100%", fontFamily: "var(--font-quiz)" }}>
      <div style={{ maxWidth: 680, width: "100%", margin: "0 auto", padding: "0 20px", paddingBottom: 60 }}>

        {/* ===== SEÇÃO 1 — Score Geral ===== */}
        <div style={{ opacity: 0, animation: "fadeUp 0.6s ease forwards", animationDelay: "0.2s" }}>
          <div style={{ textAlign: "center", padding: "24px 0 12px" }}>
            <img src="/logos/gla-logo.png" alt="Growth Leaders Academy" style={{ display: "inline-block", width: 120 }} />
          </div>
          <h1 className="result-headline" style={{ margin: "12px auto 20px" }}>
            {firstName}, aqui está o seu <span style={{ color: "#2D3246" }}>Revenue Efficiency Index</span>
          </h1>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 64, fontWeight: 700, color: "#0f172a", lineHeight: 1, fontFamily: "var(--font-display)" }}>{result.scoreGeral}</span>
            <span style={{ fontSize: 24, fontWeight: 400, color: "#94a3b8" }}>/100</span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 15, fontWeight: 600, color: result.scoreGeralColor, background: `${result.scoreGeralColor}18` }}>{result.scoreGeralLabel}</span>
          </div>
          {scoreGeralText && (
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.65, textAlign: "center", maxWidth: 540, margin: "0 auto 24px" }}>{scoreGeralText}</p>
          )}
        </div>

        {/* ===== Score de Confiança ===== */}
        {confidenceScore > 0 && (
          <div style={{ marginBottom: 24, padding: "16px 20px", borderRadius: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "rgba(20,28,40,0.06) 0 4px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5 }}>Score de Confiança</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: confidenceColor, background: `${confidenceColor}18` }}>{confidenceLabel}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{confidenceScore}/100</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, margin: 0 }}>{confidenceText}</p>
          </div>
        )}

        {/* ===== SEÇÃO 2 — Breakdown por Alavanca ===== */}
        <div className="result-top-card" style={{ padding: "24px 20px", marginTop: 0, animationDelay: "0.3s" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Breakdown por Alavanca</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {result.dimensions.map((dim, i) => (
              <DimensionBar key={dim.code} dim={dim} animDelay={0.4 + i * 0.15} />
            ))}
          </div>
          {/* Strongest / Weakest */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24, opacity: 0, animation: "fadeUp 0.5s ease forwards", animationDelay: "1.2s" }}>
            <div style={{ padding: 12, borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#059669", marginBottom: 4 }}>MAIS FORTE</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>{result.strongest.emoji} {result.strongest.name}</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{result.strongest.normalizedScore}/100</p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>MAIS FRACA</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>{result.weakest.emoji} {result.weakest.name}</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{result.weakest.normalizedScore}/100</p>
            </div>
          </div>
        </div>

        {/* ===== SEÇÃO 3 — Alavanca Mais Negligenciada ===== */}
        {weakestContent && (
          <SectionCard icon="🔴" title="Alavanca mais negligenciada" borderColor="#ef4444">
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{weakestContent.title}</p>
            {weakestContent.text.split("\n\n").map((p, i) => (
              <p key={i} style={{ marginBottom: 12 }}>{p}</p>
            ))}
          </SectionCard>
        )}

        {/* ===== SEÇÃO 3B — Cruzamento Confiança × Dimensão Fraca ===== */}
        {showSection3B && (
          <SectionCard icon="⚠️" title="Alerta: Confiança × Dimensão Fraca" borderColor="#f59e0b">
            <p>
              Nas 5 perguntas que todo líder de receita deveria responder com velocidade e confiança, seu score foi <strong>{confidenceScore}/100</strong>. Combinado com <strong>{result.weakest.name}</strong> sendo sua dimensão mais fraca (score <strong>{result.weakest.normalizedScore}</strong>), o cenário é: você tem um problema real e não tem os dados pra dimensioná-lo.
            </p>
            <p style={{ marginTop: 12 }}>
              Existe uma dissonância perigosa aqui: CROs estimam uma perda de 16% da receita por vazamento. Quem está mais perto da operação mede 26% (Clari, 2024). O risco é você estar mais perto dos 16% — achando que o problema é menor do que realmente é.
            </p>
          </SectionCard>
        )}

        {/* ===== SEÇÃO 4 — Educação: Framework das 4 Alavancas ===== */}
        <SectionCard icon="📊" title="O Framework das 4 Alavancas" borderColor="#3b82f6">
          <p><strong style={{ color: "#0f172a" }}>Quando o crescimento desacelera, a reação natural é: investir mais.</strong> Mais ads, mais leads, mais vendedores. Se o que te trouxe até aqui foi investimento agressivo, a lógica é investir mais, né?</p>
          <p style={{ marginTop: 12 }}>Só que as regras do jogo mudaram. A eficiência de crescimento caiu ~50% entre 2021 e 2023 (McKinsey). Não dá pra continuar jogando da mesma forma se a regra mudou.</p>
          <p style={{ marginTop: 12 }}>Antes de investir mais lá fora, existem 4 alavancas que são muito subaproveitadas:</p>
          <ol style={{ paddingLeft: 20, marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Posicionamento & Preço</strong> — quanto valor você captura do que já entrega</li>
            <li><strong>Geração de Demanda</strong> — de onde vêm seus leads e quanto custa cada um</li>
            <li><strong>Eficiência em Vendas</strong> — quanto do seu pipeline vira receita de verdade</li>
            <li><strong>Expansão de Base de Clientes</strong> — quanto seus clientes atuais geram de receita nova</li>
          </ol>
          <p style={{ marginTop: 12 }}>Absolutamente toda empresa consegue crescer com os recursos que já tem. Em todas as empresas que diagnosticamos, encontramos receita escondida em pelo menos uma dessas alavancas. A pergunta não é SE. É ONDE.</p>
        </SectionCard>

        {/* ===== SEÇÃO 5 — Gap Tension (tags Q4) ===== */}
        {gapTensionText && (
          <SectionCard icon="💡" title="O que isso significa pra você" borderColor="#8b5cf6">
            <p>{gapTensionText}</p>
          </SectionCard>
        )}

        {/* ===== SEÇÃO 6 — CTA ===== */}
        <div style={{ marginTop: 24, padding: "28px 20px", background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.06)", boxShadow: "rgba(20,28,40,0.06) 0 8px 24px" }}>
          {smallRevenue ? (
            <>
              <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.65 }}>
                O GLA atende empresas de R$5M a R$80M de faturamento. Quando chegar lá, estaremos aqui. Enquanto isso, use seu resultado como guia: foque na alavanca mais fraca e nos dados que mostramos. Já é um mapa.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 16 }}>
                Esse diagnóstico é um retrato rápido. O Raio-X de Receita é o filme inteiro.
              </h2>
              <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.6, marginBottom: 16 }}>
                Em 45 minutos, analisamos suas 4 alavancas com profundidade — com dados que vão além do que esse assessment mostra. Você sai com:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Onde está a maior oportunidade assimétrica de receita",
                  "Quanto de débito de crescimento acumulado está custando hoje",
                  "Qual alavanca priorizar nos próximos 90 dias",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#334155", lineHeight: 1.5 }}>
                    <span style={{ color: "#FF6F61", fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span><strong>{item.split(" ").slice(0, 3).join(" ")}</strong> {item.split(" ").slice(3).join(" ")}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Sem compromisso. Sem pitch. Só diagnóstico.</p>
              <a
                href={ctaWhatsappUrl || DEFAULT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="result-primary-cta"
                onClick={handleCtaClick}
                style={{ display: "block", textAlign: "center" }}
              >
                AGENDAR SESSÃO ESTRATÉGICA
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
