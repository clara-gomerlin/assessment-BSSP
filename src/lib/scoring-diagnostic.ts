import { Question, Dimension, DimensionResult, DiagnosticResult, Answers } from "./types";

// --- Thresholds ---

const GERAL_THRESHOLDS: { max: number; label: string; color: string }[] = [
  { max: 30, label: "Na Armadilha", color: "#e84343" },
  { max: 50, label: "Crescimento Vulnerável", color: "#f5a623" },
  { max: 70, label: "Crescimento Desequilibrado", color: "#f5a623" },
  { max: 100, label: "Crescimento Eficiente", color: "#1dbf73" },
];

const DIMENSION_THRESHOLDS: { max: number; label: string; color: string }[] = [
  { max: 33, label: "Ponto Cego", color: "#e84343" },
  { max: 66, label: "Em Desenvolvimento", color: "#f5a623" },
  { max: 100, label: "Alavanca Ativa", color: "#1dbf73" },
];

const CONFIDENCE_THRESHOLDS: { max: number; label: string; color: string }[] = [
  { max: 30, label: "Voando no Escuro", color: "#e84343" },
  { max: 50, label: "Visão Parcial", color: "#f5a623" },
  { max: 70, label: "Visão Razoável", color: "#eab308" },
  { max: 100, label: "Painel de Controle", color: "#1dbf73" },
];

// Categories for confidence questions (P1-P5)
const CONFIDENCE_CATEGORY = "confianca";

// Tie-break priority for weakest lever (first = most impactful if weak)
const WEAKEST_PRIORITY = ["PP", "EV", "GD", "EB"];

// Categories that map to scored dimensions
const DIMENSION_CATEGORIES: Record<string, string> = {
  posicionamento_preco: "PP",
  geracao_demanda: "GD",
  eficiencia_vendas: "EV",
  expansao_base: "EB",
};

function getLabel(score: number, thresholds: typeof GERAL_THRESHOLDS) {
  for (const t of thresholds) {
    if (score <= t.max) return { label: t.label, color: t.color };
  }
  return thresholds[thresholds.length - 1];
}

/**
 * Calculate diagnostic scores from answers.
 * Scored questions use `option.value` (0-5). Each dimension has 3 questions = max 15 raw.
 * Normalized to 0-100 per dimension. Score geral = average of 4 dimensions.
 */
export function calculateDiagnosticScores(
  questions: Question[],
  answers: Answers,
  dimensions: Dimension[]
): DiagnosticResult {
  // 1. Calculate raw scores per dimension
  const rawScores: Record<string, number> = {};
  const questionCounts: Record<string, number> = {};

  for (const dimCode of Object.values(DIMENSION_CATEGORIES)) {
    rawScores[dimCode] = 0;
    questionCounts[dimCode] = 0;
  }

  for (const question of questions) {
    const dimCode = DIMENSION_CATEGORIES[question.category];
    if (!dimCode) continue; // skip non-scored questions (contexto, qualificacao)

    const selectedId = answers[question.id];
    if (!selectedId || Array.isArray(selectedId)) continue; // skip unanswered or multi-select

    const option = question.options.find((o) => o.id === selectedId);
    if (!option) continue;

    rawScores[dimCode] += option.value ?? 0;
    questionCounts[dimCode]++;
  }

  // 2. Normalize to 0-100 per dimension
  const dimensionResults: DimensionResult[] = dimensions
    .filter((d) => Object.values(DIMENSION_CATEGORIES).includes(d.code))
    .map((dim) => {
      const raw = rawScores[dim.code] || 0;
      const maxRaw = (questionCounts[dim.code] || 3) * 5; // 3 questions * 5 max pts
      const normalized = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
      const { label, color } = getLabel(normalized, DIMENSION_THRESHOLDS);

      return {
        code: dim.code,
        name: dim.name,
        emoji: dim.emoji,
        rawScore: raw,
        normalizedScore: normalized,
        label,
        color,
      };
    });

  // 3. Score geral = average of 4 dimensions
  const scoreGeral =
    dimensionResults.length > 0
      ? Math.round(
          dimensionResults.reduce((sum, d) => sum + d.normalizedScore, 0) /
            dimensionResults.length
        )
      : 0;
  const { label: scoreGeralLabel, color: scoreGeralColor } = getLabel(
    scoreGeral,
    GERAL_THRESHOLDS
  );

  // 4. Strongest and weakest
  const sorted = [...dimensionResults].sort(
    (a, b) => b.normalizedScore - a.normalizedScore
  );
  const strongest = sorted[0];

  // For weakest: find lowest score, tie-break by WEAKEST_PRIORITY
  const minScore = sorted[sorted.length - 1].normalizedScore;
  const tiedWeakest = dimensionResults.filter(
    (d) => d.normalizedScore === minScore
  );
  const weakest =
    tiedWeakest.length === 1
      ? tiedWeakest[0]
      : tiedWeakest.find((d) => {
          const idx = WEAKEST_PRIORITY.indexOf(d.code);
          return (
            idx ===
            Math.min(
              ...tiedWeakest.map((t) => WEAKEST_PRIORITY.indexOf(t.code))
            )
          );
        }) || tiedWeakest[0];

  // 5. Extract qualification data
  const allQuestions = questions;
  const contextoQs = allQuestions.filter((q) => q.category === "contexto");
  const qualificacaoQs = allQuestions.filter(
    (q) => q.category === "qualificacao"
  );

  let faturamento = "";
  let papel = "";
  let emocionalTags: string[] = [];
  let crm = "";

  for (const q of contextoQs) {
    const answer = answers[q.id];
    if (q.type === "multiple_choice" && Array.isArray(answer)) {
      // Q3 — multi-select emocional
      emocionalTags = answer
        .map((optId) => {
          const opt = q.options.find((o) => o.id === optId);
          return opt?.tag || "";
        })
        .filter(Boolean);
    } else if (typeof answer === "string") {
      const opt = q.options.find((o) => o.id === answer);
      if (opt) {
        // Identify by order_index: Q1 = faturamento, Q2 = papel
        if (q.order_index <= 1) faturamento = opt.label;
        else papel = opt.label;
      }
    }
  }

  for (const q of qualificacaoQs) {
    const answer = answers[q.id];
    if (typeof answer === "string") {
      const opt = q.options.find((o) => o.id === answer);
      if (opt) crm = opt.label;
    }
  }

  // 6. Calculate confidence score (from confianca category questions)
  let confidenceRaw = 0;
  let confidenceCount = 0;
  for (const question of questions) {
    if (question.category === CONFIDENCE_CATEGORY) {
      const selectedId = answers[question.id];
      if (!selectedId || Array.isArray(selectedId)) continue;
      const option = question.options.find((o) => o.id === selectedId);
      if (option) {
        confidenceRaw += option.value ?? 0;
        confidenceCount++;
      }
    }
  }
  const confidenceMax = (confidenceCount || 5) * 5;
  const confidenceScore = confidenceMax > 0 ? Math.round((confidenceRaw / confidenceMax) * 100) : 0;
  const { label: confidenceLabel, color: confidenceColor } = getLabel(confidenceScore, CONFIDENCE_THRESHOLDS);

  return {
    scoreGeral,
    scoreGeralLabel,
    scoreGeralColor,
    dimensions: dimensionResults,
    strongest,
    weakest,
    qualification: { faturamento, papel, emocionalTags, crm },
    confidenceScore,
    confidenceLabel,
    confidenceColor,
  };
}
