import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableNames } from "@/lib/supabase";
import { QuizSettings } from "@/lib/types";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s()+-]{8,20}$/;

export async function POST(request: NextRequest) {
  try {
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

    // Resolve table name from quiz settings
    const { data: quiz } = await supabase
      .from("assessment_quizzes")
      .select("settings")
      .eq("id", quiz_id)
      .single();

    const quizSettings = quiz?.settings as QuizSettings | null;
    const tables = getTableNames(quizSettings?.company_code);

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

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
