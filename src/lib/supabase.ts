import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "customer_assessments" } }
  );
}

/**
 * Resolve table names based on company_code.
 * Pattern: ax_{company}_{q|r}
 * Falls back to shared tables when no company_code.
 */
const ALLOWED_COMPANY_CODES = new Set(["bssp"]);

export function getTableNames(companyCode?: string) {
  if (companyCode) {
    // Validate against whitelist to prevent table name injection
    const code = companyCode.toLowerCase();
    if (!ALLOWED_COMPANY_CODES.has(code)) {
      throw new Error(`Invalid company_code: ${companyCode}`);
    }
    return {
      questions: `ax_${code}_q`,
      responses: `ax_${code}_r`,
    };
  }
  return {
    questions: "assessment_questions",
    responses: "assessment_responses",
  };
}
