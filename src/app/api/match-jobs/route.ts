import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { embedding } = await request.json();

    if (!embedding) {
      return NextResponse.json({ error: "No embedding provided" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Call the RPC function match_jobs
    const threshold = 0.65; // Lowered threshold to avoid no-result state on sparse embeddings
    const { data: matches, error } = await supabase.rpc('match_jobs', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: 5
    });

    if (error) {
      console.error("RPC match_jobs error:", error);
      // fallback to simple job list if RPC fails (for UI keep-alive)
      const { data: fallbackJobs } = await supabase
        .from('jobs')
        .select('id, title, location, salary_range, job_type, experience_level, work_mode, skills_required, company_id')
        .limit(5);
      return NextResponse.json({ matches: fallbackJobs || [], warning: 'Fallback jobs from list due to RPC error' });
    }

    const normalizedMatches = Array.isArray(matches) ? matches : [];

    // If no matches returned, still provide some jobs so user doesn't see complete failure.
    if (normalizedMatches.length === 0) {
      const { data: fallbackJobs } = await supabase
        .from('jobs')
        .select('id, title, location, salary_range, job_type, experience_level, work_mode, skills_required, company_id')
        .limit(5);
      return NextResponse.json({ matches: fallbackJobs || [], warning: 'No semantic matches found; showing generic jobs.' });
    }

    const enrichedMatches = await Promise.all(normalizedMatches.map(async (match: any) => {
      if (!match.company_id) {
        return { ...match, company: "Unknown", logo_url: null };
      }

      const { data: company } = await supabase
        .from('companies')
        .select('name, logo_url')
        .eq('id', match.company_id)
        .single();

      return {
        ...match,
        company: company?.name || 'Unknown',
        logo_url: company?.logo_url || null,
      };
    }));

    return NextResponse.json({ matches: enrichedMatches });
  } catch (error: any) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: "Failed to match jobs" },
      { status: 500 }
    );
  }
}
