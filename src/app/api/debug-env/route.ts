import { NextResponse } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase-config";

export async function GET() {
  const hasPublishableDefaultKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasSupabaseKey = (() => {
    try {
      getSupabaseConfig();
      return true;
    } catch {
      return false;
    }
  })();

  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasSupabaseDatabaseUrl: Boolean(process.env.SUPABASE_DATABASE_URL),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasPublishableDefaultKey,
    hasAnonKey,
    hasSupabaseKey,
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
