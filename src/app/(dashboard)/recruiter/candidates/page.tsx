import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import CandidateSearch, { type RankedCandidate } from "@/components/features/recruiter/CandidateSearch";
import { buildCandidateRanking, CandidateProfile, RecruiterJob } from "@/lib/recruiter-matching";
import { ArrowRight, Building2, Users } from "lucide-react";

type SearchParams = {
  jobId?: string | string[];
  q?: string | string[];
};

type CompanyRecord = {
  id: string;
  name: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
};

type JobRow = {
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

export default async function RecruiterCandidatesPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jobId = typeof searchParams?.jobId === "string" ? searchParams.jobId : null;
  const initialQuery = typeof searchParams?.q === "string" ? searchParams.q : "";

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, logo_url, website, description")
    .eq("owner_id", user?.id)
    .maybeSingle();
  const companyRecord = company as CompanyRecord | null;

  if (!companyRecord) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/20">
          <Building2 size={32} className="text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">Create your company profile first</h1>
        <p className="mb-8 text-muted-foreground">
          Candidate search works best when the recruiter profile is attached to a real company.
        </p>
        <Link
          href="/recruiter/company"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Set up company profile <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const [jobsResult, candidatesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, description, location, salary_range, job_type, experience_level, work_mode, skills_required, created_at, companies(name, logo_url, website)")
      .eq("company_id", companyRecord.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select(
        "id, full_name, headline, bio, location, experience_years, skills, resume_url, linkedin_url, github_url, phone, current_company, current_role, avatar_url, updated_at"
      )
      .eq("role", "candidate")
      .order("updated_at", { ascending: false })
      .limit(24),
  ]);

  const jobs: RecruiterJob[] = ((jobsResult.data || []) as JobRow[]).map((job: JobRow) => {
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
      company_name: company?.name || companyRecord.name,
      company_logo: company?.logo_url || companyRecord.logo_url,
      company_website: company?.website || companyRecord.website,
      created_at: job.created_at,
    };
  });

  const selectedJob = jobs.find((job) => job.id === jobId) ?? jobs[0] ?? null;

  const focusJob: RecruiterJob =
    selectedJob || {
      id: "general-talent-pool",
      title: `Talent for ${companyRecord.name}`,
      description: companyRecord.description || "Broader talent search for future roles.",
      location: null,
      salary_range: null,
      job_type: null,
      experience_level: null,
      work_mode: null,
      skills_required: [],
      company: companyRecord.name,
      company_name: companyRecord.name,
      company_logo: companyRecord.logo_url,
      company_website: companyRecord.website,
    };

  const rankedCandidates: RankedCandidate[] = ((candidatesResult.data || []) as CandidateProfile[])
    .map((candidate: CandidateProfile) => ({
      ...candidate,
      ...buildCandidateRanking(focusJob, candidate),
    }))
    .sort((left, right) => right.score - left.score);

  const strongMatches = rankedCandidates.filter((candidate) => candidate.score >= 80).length;
  const averageExperience = rankedCandidates.length
    ? Math.round(
        rankedCandidates.reduce((total, candidate) => total + (candidate.experience_years ?? 0), 0) / rankedCandidates.length
      )
    : 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Users size={14} /> Candidate search
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Browse the talent pool with recruiter-grade detail.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Search by role, skill, company, or location. When a job is selected, the ranking engine shifts to that job automatically.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/recruiter/post-job"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Post a job <ArrowRight size={14} />
          </Link>
          <Link
            href="/recruiter/company"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary"
          >
            Company profile <Building2 size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard label="Candidates loaded" value={rankedCandidates.length} />
        <SummaryCard label="Strong matches" value={strongMatches} />
        <SummaryCard label="Average experience" value={`${averageExperience} yrs`} />
        <SummaryCard label="Job focus" value={selectedJob ? selectedJob.title : "General pool"} />
      </div>

      {selectedJob && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Selected role</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{selectedJob.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {selectedJob.location || "Remote-friendly"} {selectedJob.salary_range ? `• ${selectedJob.salary_range}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedJob.skills_required?.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <CandidateSearch
        candidates={rankedCandidates}
        selectedJob={selectedJob || focusJob}
        companyName={companyRecord.name || "Your company"}
        initialQuery={initialQuery}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
