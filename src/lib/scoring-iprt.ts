import { Question, Dimension, IPRTDimensionResult, IPRTResult, Answers } from "./types";

// --- Dimension config ---
const DIMENSION_CONFIG: Record<string, { weight: number; maxRaw: number }> = {
  DN: { weight: 0.30, maxRaw: 40 }, // Q4-Q7: 4 × 10pts
  AP: { weight: 0.30, maxRaw: 40 }, // Q8-Q11: 4 × 10pts
  PO: { weight: 0.20, maxRaw: 20 }, // Q12-Q13: 10 + 10
  VE: { weight: 0.20, maxRaw: 20 }, // Q14-Q15: 10 + 10
};

// Category → dimension code mapping
const CATEGORY_TO_DIM: Record<string, string> = {
  dominio_normativo: "DN",
  aplicacao_pratica: "AP",
  preparacao_operacional: "PO",
  visao_estrategica: "VE",
};

// Stages
const STAGES: { max: number; label: string; color: string }[] = [
  { max: 30, label: "Observador", color: "#e84343" },
  { max: 55, label: "Em Alerta", color: "#f5a623" },
  { max: 80, label: "Em Construção", color: "#0ea5e9" },
  { max: 100, label: "Pronto para Liderar", color: "#1dbf73" },
];

function getStage(score: number): { label: string; color: string } {
  for (const s of STAGES) {
    if (score <= s.max) return { label: s.label, color: s.color };
  }
  return STAGES[STAGES.length - 1];
}

// Checklist scoring: Q12 (6 real items + "nenhuma") and Q15 (5 real items + "nenhuma")
function scoreChecklist(selectedIds: string[], options: { id: string; label: string }[], type: "q12" | "q15"): number {
  // Filter out "nenhuma das anteriores" option (always last)
  const noneOption = options[options.length - 1];
  const realSelections = selectedIds.filter(id => id !== noneOption.id);
  const count = realSelections.length;

  if (type === "q12") {
    // Q12: 0 items = 0, 1-2 = 3, 3-4 = 6, 5-6 = 10
    if (count === 0) return 0;
    if (count <= 2) return 3;
    if (count <= 4) return 6;
    return 10;
  } else {
    // Q15: 0 items = 0, 1 = 3, 2 = 6, 3+ = 10
    if (count === 0) return 0;
    if (count === 1) return 3;
    if (count === 2) return 6;
    return 10;
  }
}

/**
 * Calculate IPRT scores from answers.
 * Q1-Q3: qualification (no score)
 * Q4-Q7: dominio_normativo (10pts each, right/wrong via option.value)
 * Q8-Q11: aplicacao_pratica (10pts each, right/wrong via option.value)
 * Q12: preparacao_operacional (multiple_choice checklist, scored by count)
 * Q13: preparacao_operacional (single_choice scale, option.value)
 * Q14: visao_estrategica (single_choice scale, option.value)
 * Q15: visao_estrategica (multiple_choice checklist, scored by count)
 */
export function calculateIPRTScores(
  questions: Question[],
  answers: Answers,
  dimensions: Dimension[]
): IPRTResult {
  const rawScores: Record<string, number> = { DN: 0, AP: 0, PO: 0, VE: 0 };

  // Track normative errors for neutralizers
  let errosNormativos = 0;
  const totalNormativos = 4; // Q4-Q7

  // Track Q12 actions count
  let acoesRealizadas = 0;

  // Track Q13 answer for neutralizer
  let aguardandoPreparacao = false;

  // Qualification data
  let perfil = "";
  let perfilCode = "";
  let numClientes = "";
  let formacao = "";
  let formacaoCode = "";

  for (const question of questions) {
    const dimCode = CATEGORY_TO_DIM[question.category];
    const answer = answers[question.id];

    // Qualification questions
    if (question.category === "qualificacao") {
      if (typeof answer === "string") {
        const opt = question.options.find(o => o.id === answer);
        if (opt) {
          if (question.order_index === 0) {
            perfil = opt.label;
            perfilCode = opt.id;
          } else if (question.order_index === 1) {
            numClientes = opt.label;
          } else if (question.order_index === 2) {
            formacao = opt.label;
            formacaoCode = opt.id;
          }
        }
      }
      continue;
    }

    if (!dimCode) continue;

    if (question.type === "multiple_choice" && Array.isArray(answer)) {
      // Checklist questions (Q12 or Q15)
      const checklistType = dimCode === "PO" ? "q12" : "q15";
      const score = scoreChecklist(answer, question.options, checklistType);
      rawScores[dimCode] += score;

      if (checklistType === "q12") {
        const noneOpt = question.options[question.options.length - 1];
        acoesRealizadas = answer.filter(id => id !== noneOpt.id).length;
      }
    } else if (typeof answer === "string") {
      const opt = question.options.find(o => o.id === answer);
      if (!opt) continue;

      const value = opt.value ?? 0;
      rawScores[dimCode] += value;

      // Track normative errors
      if (dimCode === "DN" && value === 0) {
        errosNormativos++;
      }

      // Track Q13 (preparacao_operacional single choice) — aguardando if value is 0
      if (dimCode === "PO" && question.type === "single_choice" && value === 0) {
        aguardandoPreparacao = true;
      }
    }
  }

  // Calculate percentages per dimension
  const dimensionResults: IPRTDimensionResult[] = dimensions
    .filter(d => DIMENSION_CONFIG[d.code])
    .map(dim => {
      const config = DIMENSION_CONFIG[dim.code];
      const raw = rawScores[dim.code] || 0;
      const percentage = config.maxRaw > 0 ? Math.round((raw / config.maxRaw) * 100) : 0;

      return {
        code: dim.code,
        name: dim.name,
        emoji: dim.emoji,
        rawScore: raw,
        maxScore: config.maxRaw,
        percentage,
        weight: config.weight,
      };
    });

  // Calculate weighted IPRT score
  const iprtScore = Math.round(
    dimensionResults.reduce((sum, d) => {
      const config = DIMENSION_CONFIG[d.code];
      return sum + d.percentage * config.weight;
    }, 0)
  );

  const { label: stage, color: stageColor } = getStage(iprtScore);

  // Weakest dimension (lowest percentage, tie-break by weight descending)
  const sorted = [...dimensionResults].sort((a, b) => {
    if (a.percentage !== b.percentage) return a.percentage - b.percentage;
    return b.weight - a.weight; // Higher weight = more impactful if weak
  });
  const weakestDimension = sorted[0];

  // Lead scoring
  let leadScore = 0;
  // Criterion 1: Contador or Advogado (+2)
  if (perfilCode.includes("contador") || perfilCode.includes("advogado")) {
    leadScore += 2;
  }
  // Criterion 2: 11+ clientes (+3)
  if (numClientes.includes("11") || numClientes.includes("Mais de 50")) {
    leadScore += 3;
  }
  // Criterion 3: No formal training (+3)
  if (formacaoCode.includes("noticias") || formacaoCode.includes("webinars")) {
    leadScore += 3;
  }
  // Criterion 4: IPRT between 30-70% (+2)
  if (iprtScore >= 30 && iprtScore <= 70) {
    leadScore += 2;
  }

  let leadCategory: string;
  if (leadScore >= 7) leadCategory = "quente";
  else if (leadScore >= 4) leadCategory = "morno";
  else leadCategory = "frio";

  return {
    iprtScore,
    stage,
    stageColor,
    dimensions: dimensionResults,
    weakestDimension,
    qualification: {
      perfil,
      perfilCode,
      numClientes,
      formacao,
      formacaoCode,
    },
    leadScore,
    leadCategory,
    errosNormativos,
    totalNormativos,
    aguardandoPreparacao,
    acoesRealizadas,
  };
}
