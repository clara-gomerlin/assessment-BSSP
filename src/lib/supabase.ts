import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const schema = process.env.DB_SCHEMA || "customer_assessments";
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema } }
  );
}

/**
 * Supabase client for the GLA project (public schema).
 * Used to sync assessment data to the GLA org.
 */
export function getGLASupabase() {
  const url = process.env.GLA_SUPABASE_URL;
  const key = process.env.GLA_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
