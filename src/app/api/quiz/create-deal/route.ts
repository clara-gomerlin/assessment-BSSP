import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableNames, getGLASupabase } from "@/lib/supabase";
import { createDeal, QuizAnswer, QuestionInfo, ComputedScores } from "@/lib/hubspot";
import { QuizSettings } from "@/lib/types";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "customer_assessments" } }
  );
}

// Rate limiter (per IP, 5 requests per minute)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return Response.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const body = await request.json();
    const { hubspot_contact_id, contact_name, contact_email, quiz_title, quiz_id, response_id } = body;

    if (!hubspot_contact_id || typeof hubspot_contact_id !== "string") {
      return Response.json({ error: "hubspot_contact_id inválido" }, { status: 400 });
    }

    if (!contact_name || typeof contact_name !== "string" || contact_name.trim().length < 2) {
      return Response.json({ error: "contact_name inválido" }, { status: 400 });
    }

    if (!quiz_title || typeof quiz_title !== "string") {
      return Response.json({ error: "quiz_title inválido" }, { status: 400 });
    }

    // Fetch quiz answers and scores for deal properties
    const supabase = getSupabase();
    let answers: QuizAnswer[] = [];
    let scores: ComputedScores | null = null;
    let questionInfos: QuestionInfo[] = [];
    let contactPhone: string | undefined;

    if (quiz_id && response_id) {
      // Get quiz settings to resolve table names
      const { data: quiz } = await supabase
        .from("assessment_quizzes")
        .select("settings")
        .eq("id", quiz_id)
        .single();

      const quizSettings = quiz?.settings as QuizSettings | null;
      const tables = getTableNames(quizSettings?.company_code);

      const { data: responseData } = await supabase
        .from(tables.responses)
        .select("answers, computed_scores, respondent_phone")
        .eq("id", response_id)
        .single();

      if (responseData) {
        answers = (responseData.answers || []) as QuizAnswer[];
        scores = (responseData.computed_scores || null) as ComputedScores | null;
        contactPhone = responseData.respondent_phone || undefined;
      }

      const { data: questions } = await supabase
        .from(tables.questions)
        .select("id, order_index, options")
        .eq("quiz_id", quiz_id)
        .order("order_index", { ascending: true });

      questionInfos = (questions || []).map((q: { id: string; order_index: number; options: { id: string; label: string }[] }) => ({
        id: q.id,
        order_index: q.order_index,
        options: (q.options || []).map((o: { id: string; label: string }) => ({ id: o.id, label: o.label })),
      }));
    }

    const dealId = await createDeal({
      contactId: hubspot_contact_id,
      contactName: contact_name.trim(),
      contactEmail: contact_email || undefined,
      contactPhone,
      quizName: quiz_title,
      answers,
      questions: questionInfos,
      scores,
    });

    if (!dealId) {
      return Response.json({ error: "Erro ao criar negócio" }, { status: 500 });
    }

    // Log integration event in Supabase
    const eventoConversao = `Assessment ${quiz_title}`;
    try {
      await supabase.from("integration_events").insert({
        email: contact_email || null,
        respondent_name: contact_name.trim(),
        quiz_id: quiz_id || null,
        quiz_title,
        evento_de_conversao: eventoConversao,
        tipo_registro: "negócio",
        hubspot_id: dealId,
        response_id: response_id || null,
      });
    } catch (logErr) {
      console.error("Integration event log error:", logErr);
    }

    // Sync to GLA Supabase eventos_conversao for the Máquina de Receita quiz
    const GLA_QUIZ_ID = "57a01f5f-47d2-4d06-903e-99ffc3dff78d";
    if (quiz_id === GLA_QUIZ_ID) {
      try {
        const glaSupa = getGLASupabase();
        if (glaSupa) {
          // Fluxo 2: Insert new negócio event
          await glaSupa.from("eventos_conversao").insert({
            nome: contact_name.trim(),
            email: (contact_email || "").trim().toLowerCase(),
            telefone: contactPhone || null,
            evento_conversao: eventoConversao,
            produto: "Consultoria",
            tipo_registro: "negócio",
            etapa_negocio: "Pendente",
            data_conversao: new Date().toISOString(),
          });
        }
      } catch (glaErr) {
        console.error("GLA eventos_conversao sync error:", glaErr);
      }
    }

    return Response.json({ success: true, deal_id: dealId });
  } catch (error) {
    console.error("Create deal error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
