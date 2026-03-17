import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableNames, getGLASupabase } from "@/lib/supabase";
import { QuizSettings } from "@/lib/types";
import { upsertContact, createContactNote } from "@/lib/hubspot";
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
        utmParams: Object.keys(utms).length > 0 ? utms : undefined,
      });
    } catch (hsErr) {
      console.error("HubSpot contact sync error:", hsErr);
    }

    // Resolve answer labels (needed by Chatwoot + Avalon)
    // Map order_index to fixed attribute keys matching Chatwoot definitions
    const ANSWER_KEY_MAP: Record<number, string> = {
      0: "faturamento_anual",
      1: "papel_na_empresa",
      2: "crm_principal",
      3: "sentimento_crescimento",
      4: "furos_aquisicao",
      5: "resultados_vs_vaidade",
      6: "bater_meta",
      7: "tendencias_performance",
      8: "onde_investir_energia",
      9: "dependencia_ads",
      10: "atribuicao_canais",
      11: "alinhamento_mkt_vendas",
      12: "cac_ltv",
      13: "followup_leads",
      14: "acuracia_forecast",
      15: "pipeline_review",
      16: "deals_envelhecidos",
      17: "tempo_operacional_vs_estrategico",
      18: "receita_upsell_crosssell",
      19: "risco_churn",
      20: "relacionamento_clientes",
      21: "estrategia_ticket",
      22: "revisao_pricing",
      23: "reacao_desconto",
      24: "diferencial_competitivo",
      25: "willingness_to_pay",
      26: "custo_inacao",
    };

    const answerLabels: Record<string, string> = {};
    const answersData = (existing.answers || []) as { question_id: string; selected_option_id: string | string[] }[];
    if (answersData.length > 0) {
      const { data: questions } = await supabase
        .from(tables.questions)
        .select("id, order_index, options")
        .eq("quiz_id", quiz_id);

      if (questions) {
        const qMap = new Map(questions.map((q: { id: string; order_index: number; options: { id: string; label: string }[] }) => [q.id, q]));
        for (const ans of answersData) {
          const q = qMap.get(ans.question_id);
          if (!q) continue;
          const optIds = Array.isArray(ans.selected_option_id) ? ans.selected_option_id : [ans.selected_option_id];
          const labels = optIds
            .map((id: string) => q.options.find((o: { id: string; label: string }) => o.id === id)?.label)
            .filter(Boolean);
          if (labels.length > 0) {
            const key = ANSWER_KEY_MAP[q.order_index] || `pergunta_${q.order_index}`;
            answerLabels[key] = labels.join("; ");
          }
        }
      }
    }

    // Prepare shared data
    const eventoConversao = `Assessment ${quizTitle}`;
    const computedScores = existing.computed_scores as { scoreGeral: number; dimensions: { code: string; label: string; normalizedScore: number }[] } | null;
    const aiResult = existing.ai_result as { diagnostico?: string; sinais?: string; acao?: string; acao_passos?: string[] } | null;
    const quizDimensions = (quiz?.dimensions || []) as { code: string; name: string; emoji: string }[];

    // Build parallel tasks — run ALL integrations concurrently
    const tasks: Promise<unknown>[] = [];

    // 1. Integration event log (Merlin Supabase)
    tasks.push(
      (async () => {
        const { error: logErr } = await supabase.from("integration_events").insert({
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
        if (logErr) console.error("Integration event log error:", logErr);
      })()
    );

    // 1b. HubSpot note with result link
    if (hubspotContactId) {
      const resultUrl = `https://assessment.growthleaders.academy/quiz/revenue-efficiency-index/resultado/${response_id}`;
      tasks.push(
        createContactNote({
          contactId: hubspotContactId,
          body: `📊 Resultado do ${quizTitle}\n\nLink: ${resultUrl}`,
        }).catch((err) => console.error("HubSpot note error:", err))
      );
    }

    // 2. GLA Supabase sync
    const GLA_QUIZ_ID = "57a01f5f-47d2-4d06-903e-99ffc3dff78d";
    if (quiz_id === GLA_QUIZ_ID) {
      const glaSupa = getGLASupabase();
      if (glaSupa) {
        tasks.push(
          Promise.all([
            glaSupa.from("assessment maquina de receita").update({
              email: respondent_email.trim().toLowerCase(),
              respondent_name: respondent_name.trim(),
              phone: respondent_phone?.trim() || null,
              hubspot_contact_id: hubspotContactId,
            }).eq("response_id", response_id),
            glaSupa.from("eventos_conversao").insert({
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
            }),
          ]).catch((err) => console.error("GLA Supabase lead sync error:", err))
        );
      }
    }

    // 3. Email, Chatwoot, Avalon (all parallel)
    if (computedScores && quizDimensions.length > 0) {
      const sorted = [...computedScores.dimensions].sort((a, b) => b.normalizedScore - a.normalizedScore);
      const strongest = sorted[0];
      const weakest = sorted[sorted.length - 1];
      const dimLookup = new Map(quizDimensions.map((d) => [d.code, d]));

      const dimsMapped = computedScores.dimensions.map((d) => ({
        name: dimLookup.get(d.code)?.name || d.label,
        emoji: dimLookup.get(d.code)?.emoji || "📊",
        normalizedScore: d.normalizedScore,
      }));
      const strongestMapped = {
        name: dimLookup.get(strongest.code)?.name || strongest.label,
        emoji: dimLookup.get(strongest.code)?.emoji || "📊",
        normalizedScore: strongest.normalizedScore,
      };
      const weakestMapped = {
        name: dimLookup.get(weakest.code)?.name || weakest.label,
        emoji: dimLookup.get(weakest.code)?.emoji || "📊",
        normalizedScore: weakest.normalizedScore,
      };

      // Email
      tasks.push(
        sendDiagnosticResultEmail({
          recipientName: respondent_name.trim(),
          recipientEmail: respondent_email.trim().toLowerCase(),
          scoreGeral: computedScores.scoreGeral,
          scoreGeralLabel: getScoreLabel(computedScores.scoreGeral),
          dimensions: dimsMapped.map((d) => ({ ...d, statusLabel: "", statusColor: "" })),
          strongest: strongestMapped,
          weakest: weakestMapped,
          analysis: aiResult || undefined,
          quizTitle,
          ctaUrl: quizSettings?.cta_whatsapp_url,
          responseId: response_id,
        }).catch((err) => console.error("Result email error:", err))
      );

      // Chatwoot
      tasks.push(
        syncToChatwoot({
          recipientName: respondent_name.trim(),
          recipientEmail: respondent_email.trim().toLowerCase(),
          recipientPhone: respondent_phone?.trim(),
          quizTitle,
          scoreGeral: computedScores.scoreGeral,
          scoreGeralLabel: getScoreLabel(computedScores.scoreGeral),
          dimensions: dimsMapped,
          strongest: strongestMapped,
          weakest: weakestMapped,
          answerLabels,
          utmParams: utms,
        }).catch((err) => console.error("Chatwoot sync error:", err))
      );

      // Avalon
      const avalonParams: Record<string, string | number> = {
        score_geral: computedScores.scoreGeral,
        classificacao: getScoreLabel(computedScores.scoreGeral),
        alavanca_forte: `${strongestMapped.name} (${strongestMapped.normalizedScore}/100)`,
        alavanca_fraca: `${weakestMapped.name} (${weakestMapped.normalizedScore}/100)`,
      };
      for (const dim of dimsMapped) {
        avalonParams[`score_${dim.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")}`] = dim.normalizedScore;
      }
      Object.assign(avalonParams, answerLabels);

      tasks.push(
        sendAvalonConversion({
          conversionName: `Assessment ${quizTitle}`,
          name: respondent_name.trim(),
          email: respondent_email.trim().toLowerCase(),
          phone: respondent_phone?.trim(),
          avalonParameters: avalonParams,
          utmParams: utms,
        }).catch((err) => console.error("Avalon sync error:", err))
      );
    }

    // Run all integrations in parallel — don't block the response
    await Promise.allSettled(tasks);

    return Response.json({ success: true, hubspot_contact_id: hubspotContactId });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
