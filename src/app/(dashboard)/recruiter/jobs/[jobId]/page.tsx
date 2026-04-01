import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { buildCandidateRanking, CandidateProfile, RecruiterJob } from "@/lib/recruiter-matching";
import { ArrowRight, BadgeCheck, Briefcase, Building2, Calendar, MapPin, Sparkles, Users } from "lucide-react";

export default async function RecruiterJobPage({ params }: { params: { jobId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, logo_url, website, description")
    .eq("owner_id", user?.id)
    .maybeSingle();

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/20">
          <Building2 size={32} className="text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">Create your company profile first</h1>
        <p className="mb-8 text-muted-foreground">Job management is tied to your company record.</p>
        <Link href="/recruiter/company" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90">
          Set up company profile <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, location, salary_range, job_type, experience_level, work_mode, skills_required, created_at, companies(name, logo_url, website, description)")
    .eq("id", params.jobId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/20">
          <Briefcase size={32} className="text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">Job not found</h1>
        <p className="mb-8 text-muted-foreground">The job may have been removed or it does not belong to your company.</p>
        <Link href="/recruiter/my-jobs" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90">
          Back to jobs <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const normalizedJob: RecruiterJob = {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    salary_range: job.salary_range,
    job_type: job.job_type,
    experience_level: job.experience_level,
    work_mode: job.work_mode,
    skills_required: job.skills_required,
    company_name: (Array.isArray(job.companies) ? job.companies[0] : job.companies)?.name || company.name,
    company_logo: (Array.isArray(job.companies) ? job.companies[0] : job.companies)?.logo_url || company.logo_url,
    company_website: (Array.isArray(job.companies) ? job.companies[0] : job.companies)?.website || company.website,
    created_at: job.created_at,
  };

  const [applicationsResult, candidatesResult] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("job_id", job.id),
    supabase
      .from("profiles")
      .select(
        "id, full_name, headline, bio, location, experience_years, skills, resume_url, linkedin_url, github_url, phone, current_company, current_role, avatar_url, updated_at"
      )
      .eq("role", "candidate")
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  const rankedCandidates = (candidatesResult.data || [])
    .map((candidate: CandidateProfile) => ({
      ...candidate,
      ...buildCandidateRanking(normalizedJob, candidate),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  const topScore = rankedCandidates[0]?.score || 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Briefcase size={14} /> Job details
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{normalizedJob.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              This page keeps the job, the employer brand, and the candidate recommendations in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/recruiter/candidates?jobId=${normalizedJob.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Search candidates <ArrowRight size={14} />
          </Link>
          <Link
            href="/recruiter/my-jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary"
          >
            Back to jobs <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Applicants" value={applicationsResult.count || 0} icon={<Users size={16} />} />
        <SummaryCard label="Top candidate" value={`${topScore}%`} icon={<Sparkles size={16} />} />
        <SummaryCard label="Created" value={normalizedJob.created_at ? new Date(normalizedJob.created_at).toLocaleDateString() : "Recent"} icon={<Calendar size={16} />} />
        <SummaryCard label="Work mode" value={normalizedJob.work_mode || "Flexible"} icon={<BadgeCheck size={16} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role overview</div>
                <h2 className="mt-2 text-2xl font-bold text-foreground">{normalizedJob.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {normalizedJob.location || "Location flexible"}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{normalizedJob.salary_range || "Salary not disclosed"}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="capitalize">{normalizedJob.job_type || "full-time"}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company</div>
                <div className="mt-1 text-sm font-bold text-foreground">{company.name}</div>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-primary hover:underline">
                    Visit website
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{normalizedJob.description}</p>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {normalizedJob.skills_required?.length ? (
                    normalizedJob.skills_required.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No explicit skills are listed yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-foreground">Why this role is attractive</h3>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>• The role now has a company context, so it can live across recruiter screens without feeling generic.</p>
              <p>• You can jump straight into candidate search with the right job pre-selected.</p>
              <p>• The top candidates below are ranked against the role instead of a flat directory search.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top matches</div>
                <h3 className="mt-1 text-lg font-bold text-foreground">Best candidates for this role</h3>
              </div>
              <Link href={`/recruiter/candidates?jobId=${normalizedJob.id}`} className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {rankedCandidates.length > 0 ? (
                rankedCandidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-2xl border border-border bg-secondary/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-foreground">{candidate.full_name || "Anonymous candidate"}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {candidate.headline || candidate.current_role || "Open to new opportunities"}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {candidate.location || "Location not set"} • {candidate.experience_years ?? 0} yrs experience
                        </div>
                      </div>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {candidate.score}%
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {candidate.matchingSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{candidate.reasoning}</p>
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Next step: {candidate.nextStep}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-8 text-center text-muted-foreground">
                  No candidates have been ranked yet. Search the full pool to surface stronger matches.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next action</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use the candidate search view to shortlist, compare, and contact the strongest profiles for this role.
            </p>
            <Link
              href={`/recruiter/candidates?jobId=${normalizedJob.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Search candidates <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl border border-border bg-secondary/20 p-2 text-primary">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
