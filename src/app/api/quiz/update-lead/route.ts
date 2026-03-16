import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableNames, getGLASupabase } from "@/lib/supabase";
import { QuizSettings } from "@/lib/types";
import { upsertContact } from "@/lib/hubspot";
import { sendDiagnosticResultEmail } from "@/lib/email";
import { syncToChatwoot } from "@/lib/chatwoot";
import { sendAvalonConversion } from "@/lib/avalon";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "customer_assessments" } }
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s()+-]{8,20}$/;

// Rate limiter (per IP, 10 requests per minute)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

function getScoreLabel(score: number): string {
  if (score >= 81) return "Máquina Afinada";
  if (score >= 61) return "Em Aceleração";
  if (score >= 41) return "Crescimento Vulnerável";
  if (score >= 21) return "Na Armadilha";
  return "Alerta Vermelho";
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return Response.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 });
    }

    const body = await request.json();
    const { response_id, quiz_id, respondent_name, respondent_email, respondent_phone, utm_params } = body;
    const utms = (utm_params || {}) as Record<string, string>;

    if (!response_id || typeof response_id !== "string" || !UUID_RE.test(response_id))
      return Response.json({ error: "response_id inválido" }, { status: 400 });

    if (!quiz_id || typeof quiz_id !== "string" || !UUID_RE.test(quiz_id))
      return Response.json({ error: "quiz_id inválido" }, { status: 400 });

    if (typeof respondent_name !== "string" || respondent_name.trim().length < 2)
      return Response.json({ error: "Nome inválido" }, { status: 400 });

    if (typeof respondent_email !== "string" || !EMAIL_RE.test(respondent_email))
      return Response.json({ error: "Email inválido" }, { status: 400 });

    if (respondent_phone && (typeof respondent_phone !== "string" || !PHONE_RE.test(respondent_phone)))
      return Response.json({ error: "Telefone inválido" }, { status: 400 });

    const supabase = getSupabase();

    // Resolve table name and quiz title from quiz settings
    const { data: quiz, error: quizError } = await supabase
      .from("assessment_quizzes")
      .select("title, settings, dimensions")
      .eq("id", quiz_id)
      .single();

    if (quizError) {
      console.error("Quiz fetch error:", quizError.message, quizError.code);
    }

    const quizSettings = quiz?.settings as QuizSettings | null;
    const tables = getTableNames(quizSettings?.company_code);

    // Verify the response exists and has no lead data yet (prevents overwriting)
    const { data: existing, error: existingError } = await supabase
      .from(tables.responses)
      .select("respondent_email, computed_scores, ai_result, answers")
      .eq("id", response_id)
      .single();

    if (existingError) {
      console.error("Response fetch error:", existingError.message, existingError.code);
    }

    if (!existing) {
      return Response.json({ error: "Resposta não encontrada" }, { status: 404 });
    }

    if (existing.respondent_email) {
      return Response.json({ error: "Dados já preenchidos" }, { status: 409 });
    }

    const { error } = await supabase
      .from(tables.responses)
      .update({
        respondent_name: respondent_name.trim(),
        respondent_email: respondent_email.trim().toLowerCase(),
        respondent_phone: respondent_phone?.trim() || null,
      })
      .eq("id", response_id);

    if (error) {
      console.error("Update lead error:", error.message, error.code);
      return Response.json({ error: "Erro ao atualizar dados" }, { status: 500 });
    }

    // Prepare HubSpot data
    const nameParts = respondent_name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";
    const quizTitle = quiz?.title || "Quiz";

    let hubspotContactId: string | null = null;
    try {
      hubspotContactId = await upsertContact({
        email: respondent_email.trim().toLowerCase(),
        firstName,
        lastName,
        phone: respondent_phone?.trim(),
        quizName: quizTitle,
      });
    } catch (hsErr) {
      console.error("HubSpot contact sync error:", hsErr);
    }

    // Log integration event in Supabase
    const eventoConversao = `Assessment ${quizTitle}`;
    try {
      await supabase.from("integration_events").insert({
        email: respondent_email.trim().toLowerCase(),
        respondent_name: respondent_name.trim(),
        quiz_id,
        quiz_title: quizTitle,
        evento_de_conversao: eventoConversao,
        produto: "Consultoria",
        tipo_registro: "contato",
        hubspot_id: hubspotContactId,
        response_id,
      });
    } catch (logErr) {
      console.error("Integration event log error:", logErr);
    }

    // Sync lead data to GLA Supabase for the Máquina de Receita quiz
    const GLA_QUIZ_ID = "57a01f5f-47d2-4d06-903e-99ffc3dff78d";
    if (quiz_id === GLA_QUIZ_ID) {
      try {
        const glaSupa = getGLASupabase();
        if (glaSupa) {
          await glaSupa
            .from("assessment maquina de receita")
            .update({
              email: respondent_email.trim().toLowerCase(),
              respondent_name: respondent_name.trim(),
              phone: respondent_phone?.trim() || null,
              hubspot_contact_id: hubspotContactId,
            })
            .eq("response_id", response_id);

          // Fluxo 1: Insert conversion event (contato) into GLA eventos_conversao
          await glaSupa.from("eventos_conversao").insert({
            nome: respondent_name.trim(),
            email: respondent_email.trim().toLowerCase(),
            telefone: respondent_phone?.trim() || null,
            evento_conversao: eventoConversao,
            produto: "Consultoria",
            tipo_registro: "contato",
            data_conversao: new Date().toISOString(),
            campaing_source: utms.utm_source || null,
            campaing_medium: utms.utm_medium || null,
            campaing_name: utms.utm_campaign || null,
            campaing_content: utms.utm_content || null,
            campaing_term: utms.utm_term || null,
          });
        }
      } catch (glaErr) {
        console.error("GLA Supabase lead sync error:", glaErr);
      }
    }

    // Resolve answer labels (shared by email, Chatwoot, Avalon)
    const answerLabels: Record<string, string> = {};
    const answersData = (existing.answers || []) as { question_id: string; selected_option_id: string | string[] }[];
    if (answersData.length > 0) {
      const { data: questions } = await supabase
        .from(tables.questions)
        .select("id, text, options")
        .eq("quiz_id", quiz_id);

      if (questions) {
        const qMap = new Map(questions.map((q: { id: string; text: string; options: { id: string; label: string }[] }) => [q.id, q]));
        for (const ans of answersData) {
          const q = qMap.get(ans.question_id);
          if (!q) continue;
          const optIds = Array.isArray(ans.selected_option_id) ? ans.selected_option_id : [ans.selected_option_id];
          const labels = optIds
            .map((id: string) => q.options.find((o: { id: string; label: string }) => o.id === id)?.label)
            .filter(Boolean);
          if (labels.length > 0) {
            const key = q.text.slice(0, 60).toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/_+$/, "");
            answerLabels[key] = labels.join("; ");
          }
        }
      }
    }

    // Send result email if we have scores (diagnostic quiz)
    const computedScores = existing.computed_scores as { scoreGeral: number; dimensions: { code: string; label: string; normalizedScore: number }[] } | null;
    const aiResult = existing.ai_result as { diagnostico?: string; sinais?: string; acao?: string; acao_passos?: string[] } | null;
    const quizDimensions = (quiz?.dimensions || []) as { code: string; name: string; emoji: string }[];

    if (computedScores && quizDimensions.length > 0) {
      const sorted = [...computedScores.dimensions].sort((a, b) => b.normalizedScore - a.normalizedScore);
      const strongest = sorted[0];
      const weakest = sorted[sorted.length - 1];
      const dimLookup = new Map(quizDimensions.map((d) => [d.code, d]));

      try {
        await sendDiagnosticResultEmail({
          recipientName: respondent_name.trim(),
          recipientEmail: respondent_email.trim().toLowerCase(),
          scoreGeral: computedScores.scoreGeral,
          scoreGeralLabel: getScoreLabel(computedScores.scoreGeral),
          dimensions: computedScores.dimensions.map((d) => ({
            name: dimLookup.get(d.code)?.name || d.label,
            emoji: dimLookup.get(d.code)?.emoji || "📊",
            normalizedScore: d.normalizedScore,
            statusLabel: "",
            statusColor: "",
          })),
          strongest: {
            name: dimLookup.get(strongest.code)?.name || strongest.label,
            emoji: dimLookup.get(strongest.code)?.emoji || "📊",
            normalizedScore: strongest.normalizedScore,
          },
          weakest: {
            name: dimLookup.get(weakest.code)?.name || weakest.label,
            emoji: dimLookup.get(weakest.code)?.emoji || "📊",
            normalizedScore: weakest.normalizedScore,
          },
          analysis: aiResult || undefined,
          quizTitle,
          ctaUrl: quizSettings?.cta_whatsapp_url,
        });
      } catch (emailErr) {
        console.error("Result email error:", emailErr);
      }

      // Sync to Chatwoot
      try {
        await syncToChatwoot({
          recipientName: respondent_name.trim(),
          recipientEmail: respondent_email.trim().toLowerCase(),
          recipientPhone: respondent_phone?.trim(),
          quizTitle,
          scoreGeral: computedScores.scoreGeral,
          scoreGeralLabel: getScoreLabel(computedScores.scoreGeral),
          dimensions: computedScores.dimensions.map((d) => ({
            name: dimLookup.get(d.code)?.name || d.label,
            emoji: dimLookup.get(d.code)?.emoji || "📊",
            normalizedScore: d.normalizedScore,
          })),
          strongest: {
            name: dimLookup.get(strongest.code)?.name || strongest.label,
            emoji: dimLookup.get(strongest.code)?.emoji || "📊",
            normalizedScore: strongest.normalizedScore,
          },
          weakest: {
            name: dimLookup.get(weakest.code)?.name || weakest.label,
            emoji: dimLookup.get(weakest.code)?.emoji || "📊",
            normalizedScore: weakest.normalizedScore,
          },
          answerLabels,
          utmParams: utms,
        });
      } catch (cwErr) {
        console.error("Chatwoot sync error:", cwErr);
      }
    }

    // Send conversion to Avalon
    try {
      const avalonParams: Record<string, string | number> = {};

      if (computedScores) {
        avalonParams.score_geral = computedScores.scoreGeral;
        avalonParams.classificacao = getScoreLabel(computedScores.scoreGeral);
        for (const dim of computedScores.dimensions) {
          const dimInfo = quizDimensions.find((d) => d.code === dim.code);
          const dimName = dimInfo?.name || dim.label;
          avalonParams[`score_${dimName.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")}`] = dim.normalizedScore;
        }
        if (computedScores.dimensions.length > 0) {
          const avalonSorted = [...computedScores.dimensions].sort((a, b) => b.normalizedScore - a.normalizedScore);
          const s = avalonSorted[0];
          const w = avalonSorted[avalonSorted.length - 1];
          const sInfo = quizDimensions.find((d) => d.code === s.code);
          const wInfo = quizDimensions.find((d) => d.code === w.code);
          avalonParams.alavanca_forte = `${sInfo?.name || s.label} (${s.normalizedScore}/100)`;
          avalonParams.alavanca_fraca = `${wInfo?.name || w.label} (${w.normalizedScore}/100)`;
        }
      }

      // Reuse resolved answer labels
      Object.assign(avalonParams, answerLabels);

      await sendAvalonConversion({
        conversionName: `Assessment ${quizTitle}`,
        name: respondent_name.trim(),
        email: respondent_email.trim().toLowerCase(),
        phone: respondent_phone?.trim(),
        avalonParameters: avalonParams,
        utmParams: utms,
      });
    } catch (avalonErr) {
      console.error("Avalon sync error:", avalonErr);
    }

    return Response.json({ success: true, hubspot_contact_id: hubspotContactId });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
