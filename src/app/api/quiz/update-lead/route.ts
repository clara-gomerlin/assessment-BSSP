import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableNames } from "@/lib/supabase";
import { QuizSettings } from "@/lib/types";
import { upsertContact } from "@/lib/hubspot";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return Response.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 });
    }

    const body = await request.json();
    const { response_id, quiz_id, respondent_name, respondent_email, respondent_phone } = body;

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
    const { data: quiz } = await supabase
      .from("assessment_quizzes")
      .select("title, settings")
      .eq("id", quiz_id)
      .single();

    const quizSettings = quiz?.settings as QuizSettings | null;
    const tables = getTableNames(quizSettings?.company_code);

    // Verify the response exists and has no lead data yet (prevents overwriting)
    const { data: existing } = await supabase
      .from(tables.responses)
      .select("respondent_email")
      .eq("id", response_id)
      .single();

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
      console.error("Update lead error:", error);
      return Response.json({ error: "Erro ao atualizar dados" }, { status: 500 });
    }

    // Sync to HubSpot (fire and forget — don't block response)
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

    return Response.json({ success: true, hubspot_contact_id: hubspotContactId });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
