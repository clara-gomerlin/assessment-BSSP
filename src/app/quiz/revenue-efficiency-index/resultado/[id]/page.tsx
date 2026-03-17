import { getSupabase, getTableNames } from "@/lib/supabase";
import { Quiz, Dimension, DimensionResult } from "@/lib/types";
import DiagnosticResultView from "@/components/DiagnosticResultView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Reconstruct thresholds (same as scoring-diagnostic.ts)
const GERAL_THRESHOLDS = [
  { max: 30, label: "Na Armadilha", color: "#e84343" },
  { max: 50, label: "Crescimento Vulnerável", color: "#f5a623" },
  { max: 70, label: "Crescimento Desequilibrado", color: "#f5a623" },
  { max: 100, label: "Crescimento Eficiente", color: "#1dbf73" },
];

const DIMENSION_THRESHOLDS = [
  { max: 33, label: "Ponto Cego", color: "#e84343" },
  { max: 66, label: "Em Desenvolvimento", color: "#f5a623" },
  { max: 100, label: "Alavanca Ativa", color: "#1dbf73" },
];

function getLabel(score: number, thresholds: typeof GERAL_THRESHOLDS) {
  for (const t of thresholds) {
    if (score <= t.max) return { label: t.label, color: t.color };
  }
  return { label: thresholds[thresholds.length - 1].label, color: thresholds[thresholds.length - 1].color };
}

function parseAnalysis(resultMarkdown: string | null) {
  if (!resultMarkdown) return null;
  try {
    const jsonMatch = resultMarkdown.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { type: "analysis" as const, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export default async function ResultadoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabase();

  // We don't know the table yet — try shared table first, then check quiz for company_code
  // First, try to find in shared assessment_responses
  let response = null;
  let quiz: Quiz | null = null;

  // Try shared table
  const { data: sharedResponse } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("id", id)
    .single();

  if (sharedResponse) {
    response = sharedResponse;
  }

  if (!response) {
    notFound();
  }

  // Fetch quiz
  const { data: quizData } = await supabase
    .from("assessment_quizzes")
    .select("*")
    .eq("id", response.quiz_id)
    .single();

  if (!quizData) {
    notFound();
  }

  quiz = quizData as Quiz;
  const quizType = quiz.settings?.quiz_type;

  // If it's a different table (company_code), re-fetch from correct table
  if (quiz.settings?.company_code) {
    const tables = getTableNames(quiz.settings.company_code);
    const { data: companyResponse } = await supabase
      .from(tables.responses)
      .select("*")
      .eq("id", id)
      .single();

    if (companyResponse) {
      response = companyResponse;
    }
  }

  // Reconstruct result data from computed_scores
  const computedScores = response.computed_scores as {
    scoreGeral: number;
    confidenceScore?: number;
    confidenceLabel?: string;
    confidenceColor?: string;
    dimensions: { code: string; normalizedScore: number; label: string }[];
  } | null;

  if (!computedScores) {
    notFound();
  }

  // Build dimension results with full data
  const quizDimensions = (quiz.dimensions || []) as Dimension[];
  const dimLookup = new Map(quizDimensions.map((d) => [d.code, d]));

  const dimensionResults: DimensionResult[] = computedScores.dimensions.map((d) => {
    const dimInfo = dimLookup.get(d.code);
    const { label: statusLabel, color: statusColor } = getLabel(d.normalizedScore, DIMENSION_THRESHOLDS);
    return {
      code: d.code,
      name: dimInfo?.name || d.label || d.code,
      emoji: dimInfo?.emoji || "📊",
      description: dimInfo?.description || "",
      label: d.label || statusLabel,
      color: statusColor,
      normalizedScore: d.normalizedScore,
      statusLabel,
      statusColor,
      rawScore: 0,
      maxScore: 0,
      questionCount: 0,
    };
  });

  // Find strongest and weakest
  const sorted = [...dimensionResults].sort((a, b) => b.normalizedScore - a.normalizedScore);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const { label: scoreGeralLabel, color: scoreGeralColor } = getLabel(computedScores.scoreGeral, GERAL_THRESHOLDS);

  // Parse analysis from result_markdown
  const analysis = parseAnalysis(response.result_markdown);

  // Build result object matching DiagnosticResultViewProps
  const resultData = {
    type: "meta" as const,
    scoreGeral: computedScores.scoreGeral,
    scoreGeralLabel,
    scoreGeralColor,
    dimensions: dimensionResults,
    strongest,
    weakest,
    qualification: {
      faturamento: "",
      papel: "",
      emocionalTags: [] as string[],
      crm: "",
    },
    confidenceScore: computedScores.confidenceScore || 0,
    confidenceLabel: computedScores.confidenceLabel || "",
    confidenceColor: computedScores.confidenceColor || "",
  };

  if (quizType === "diagnostic") {
    return (
      <DiagnosticResultView
        result={resultData}
        analysis={analysis}
        markdown={response.result_markdown || ""}
        respondentName={response.respondent_name || ""}
        respondentEmail={response.respondent_email || ""}
        quizSlug={quiz.slug}
        quizId={quiz.id}
        responseId={id}
        ctaWhatsappUrl={quiz.settings?.cta_whatsapp_url}
        quizTitle={quiz.title}
      />
    );
  }

  // Fallback for non-diagnostic quizzes
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ fontSize: 16, color: "#64748b" }}>Resultado não disponível para visualização.</p>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: response } = await supabase
    .from("assessment_responses")
    .select("quiz_id, respondent_name")
    .eq("id", id)
    .single();

  if (!response) return { title: "Resultado não encontrado" };

  const { data: quiz } = await supabase
    .from("assessment_quizzes")
    .select("title")
    .eq("id", response.quiz_id)
    .single();

  const name = response.respondent_name?.split(" ")[0] || "";

  return {
    title: `${name ? name + " — " : ""}Resultado | ${quiz?.title || "Assessment"}`,
  };
}
