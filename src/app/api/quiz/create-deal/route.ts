import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getGLASupabase } from "@/lib/supabase";
import { createDeal } from "@/lib/hubspot";

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

    const dealId = await createDeal({
      contactId: hubspot_contact_id,
      contactName: contact_name.trim(),
      quizName: quiz_title,
    });

    if (!dealId) {
      return Response.json({ error: "Erro ao criar negócio" }, { status: 500 });
    }

    // Log integration event in Supabase
    const supabase = getSupabase();
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
          // Fluxo 2: Insert conversion event (negócio) into GLA eventos_conversao
          await glaSupa.from("eventos_conversao").insert({
            nome: contact_name.trim(),
            email: contact_email || null,
            evento_conversao: eventoConversao,
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
