import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Resolve table names based on company_code.
 * Pattern: ax_{company}_{q|r}
 * Falls back to shared tables when no company_code.
 */
export function getTableNames(companyCode?: string) {
  if (companyCode) {
    return {
      questions: `ax_${companyCode}_q`,
      responses: `ax_${companyCode}_r`,
    };
  }
  return {
    questions: "assessment_questions",
    responses: "assessment_responses",
  };
}
