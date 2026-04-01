import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import AIMatchWorkspace from "@/components/features/dashboard/AIMatchWorkspace";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { CandidateProfile, RecruiterJob } from "@/lib/recruiter-matching";

type DashboardJobRow = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  experience_level: string | null;
  work_mode: string | null;
  skills_required: string[] | null;
  created_at: string | null;
  companies: {
    name: string | null;
    logo_url: string | null;
    website: string | null;
  }[] | null;
};

export default async function DashboardAIMatchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, headline, bio, location, experience_years, skills, resume_url, linkedin_url, github_url, phone, current_company, current_role, avatar_url, updated_at"
    )
    .eq("id", user?.id)
    .maybeSingle();

  const { data: jobRows } = await supabase
    .from("jobs")
    .select(
      "id, title, description, location, salary_range, job_type, experience_level, work_mode, skills_required, created_at, companies(name, logo_url, website)"
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const fallbackJobs: RecruiterJob[] = (jobRows || []).map((job: DashboardJobRow) => {
    const company = job.companies?.[0] ?? null;

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      salary_range: job.salary_range,
      job_type: job.job_type,
      experience_level: job.experience_level,
      work_mode: job.work_mode,
      skills_required: job.skills_required,
      company_name: company?.name || null,
      company_logo: company?.logo_url || null,
      company_website: company?.website || null,
      created_at: job.created_at,
    };
  });

  const safeProfile: CandidateProfile =
    profile || {
      id: user?.id || "anonymous",
      full_name: user?.user_metadata?.full_name || user?.email || null,
      headline: null,
      bio: null,
      location: null,
      experience_years: null,
      skills: [],
      resume_url: null,
      linkedin_url: null,
      github_url: null,
      phone: null,
      current_company: null,
      current_role: null,
      avatar_url: user?.user_metadata?.avatar_url || null,
      updated_at: null,
    };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <BrainCircuit size={14} /> Dashboard AI match
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Your saved profile is now the source of truth.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              This dashboard view skips the upload step and runs the match engine against the profile you have already built.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
            Update profile <ArrowRight size={14} />
          </Link>
          <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary">
            Browse jobs <Sparkles size={14} />
          </Link>
        </div>
      </div>

      <AIMatchWorkspace profile={safeProfile} fallbackJobs={fallbackJobs} />
    </div>
  );
}
