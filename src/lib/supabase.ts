import { createClient } from "@supabase/supabase-js";
import { Question } from "./types";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "bssp" },
      global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }) },
    }
  );
}

/**
 * Supabase client for the GLA project (public schema).
 * Used to sync assessment data to the GLA org.
 */
export function getGLASupabase() {
  const url = process.env.GLA_SUPABASE_URL;
  const key = process.env.GLA_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// BSSP IPRT — per-question column map
const QUESTION_COLUMN_MAP: Record<number, string> = {
  0: "q0_area_atuacao",
  1: "q1_clientes_impactados",
  2: "q2_investimento_formacao",
  3: "q3_split_payment",
  4: "q4_inicio_transicao_2026",
  5: "q5_simples_nacional",
  6: "q6_carga_tributaria_unificacao",
  7: "q7_cliente_servicos_preco_subir",
  8: "q8_contratos_longo_prazo_2030",
  9: "q9_incentivos_fiscais_guerra_fiscal",
  10: "q10_sistema_fiscal_agora_ou_esperar",
  11: "q11_acoes_ja_realizadas",
  12: "q12_estagio_preparacao",
  13: "q13_maior_impacto_carreira",
  14: "q14_oportunidades_mercado",
};

const PILAR_COLUMN_MAP: Record<string, string> = {
  DN: "pilar_dn", AP: "pilar_ap", PO: "pilar_po", VE: "pilar_ve",
};

export function buildPerQuestionData(
  questions: Question[],
  answers: Record<string, string | string[]>
): Record<string, string> {
  const result: Record<string, string> = {};
  const qMap = new Map(questions.map((q) => [q.id, q]));

  for (const [questionId, optionValue] of Object.entries(answers)) {
    const q = qMap.get(questionId);
    if (!q) continue;
    const colName = QUESTION_COLUMN_MAP[q.order_index];
    if (!colName) continue;

    if (q.type === "open_text") {
      result[colName] = Array.isArray(optionValue) ? optionValue.join(" | ") : optionValue;
      continue;
    }

    const optIds = Array.isArray(optionValue) ? optionValue : [optionValue];
    const labels = optIds
      .map((id) => q.options.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    if (labels.length > 0) result[colName] = labels.join(" | ");
  }
  return result;
}

export function buildPilarData(
  computedScores: Record<string, unknown>
): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {};
  const dims = computedScores.dimensions as { code: string; percentage?: number }[] | undefined;
  if (!dims) return {};

  let bestCode: string | null = null;
  let worstCode: string | null = null;
  let bestScore = -1;
  let worstScore = 101;

  for (const d of dims) {
    const col = PILAR_COLUMN_MAP[d.code];
    if (!col) continue;
    const score = d.percentage ?? 0;
    result[col] = Math.round(score);
    if (score > bestScore) { bestScore = score; bestCode = d.code; }
    if (score < worstScore) { worstScore = score; worstCode = d.code; }
  }

  result.melhor_pilar = bestCode;
  result.pior_pilar = worstCode;
  result.score_geral = computedScores.iprtScore != null ? Math.round(computedScores.iprtScore as number) : null;
  result.estagio = (computedScores.stage as string) || null;
  return result;
}
