import { NextRequest } from "next/server";
import { createDeal } from "@/lib/hubspot";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const { hubspot_contact_id, contact_name, quiz_title } = body;

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

    return Response.json({ success: true, deal_id: dealId });
  } catch (error) {
    console.error("Create deal error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
