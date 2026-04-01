import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import CompanyProfileForm from "@/components/features/jobs/CompanyProfileForm";
import { ArrowRight, BadgeCheck, Briefcase, Building2, Globe2, Sparkles, Users } from "lucide-react";

type CompanyRecord = {
  id: string;
  name: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  owner_id: string;
  created_at: string | null;
};

type RecentJobRow = {
  id: string;
  title: string;
  location: string | null;
  salary_range: string | null;
  created_at: string | null;
  job_type: string | null;
};

export default async function RecruiterCompanyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, logo_url, website, description, owner_id, created_at")
    .eq("owner_id", user?.id)
    .maybeSingle();
  const companyRecord = company as CompanyRecord | null;

  const { count: jobsCount } = companyRecord
    ? await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", companyRecord.id)
    : { count: 0 };

  const { data: recentJobs } = companyRecord
    ? await supabase
        .from("jobs")
        .select("id, title, location, salary_range, created_at, job_type")
        .eq("company_id", companyRecord.id)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] };

  const brandScore = [companyRecord?.name, companyRecord?.logo_url, companyRecord?.website, companyRecord?.description]
    .filter((value) => value && value.trim().length > 0)
    .length * 25;

  const profileStatus = companyRecord ? (brandScore >= 75 ? "Strong" : brandScore >= 50 ? "Growing" : "Early") : "Not started";

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Building2 size={14} /> Company profile
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Make the company page feel real.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Candidates trust recruiter profiles that show a clear mission, a real website, and enough detail to understand the team behind the roles.
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
            href="/recruiter/candidates"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary"
          >
            Search talent <Users size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open roles" value={jobsCount || 0} icon={<Briefcase size={16} />} />
        <MetricCard label="Brand score" value={`${brandScore}%`} icon={<Sparkles size={16} />} />
        <MetricCard label="Profile status" value={profileStatus} icon={<BadgeCheck size={16} />} />
        <MetricCard label="Website" value={companyRecord?.website ? "Live" : "Missing"} icon={<Globe2 size={16} />} />
      </div>

      {recentJobs && recentJobs.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent jobs tied to this company</h2>
              <p className="text-sm text-muted-foreground">A recruiter profile feels stronger when the company and roles are connected.</p>
            </div>
            <Link href="/recruiter/my-jobs" className="text-sm font-bold text-primary hover:underline">
              View all jobs
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {(recentJobs as RecentJobRow[]).map((job) => (
              <div key={job.id} className="rounded-2xl border border-border bg-secondary/10 p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active role</div>
                <div className="mt-2 text-lg font-bold text-foreground">{job.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{job.location || "Location flexible"}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{job.salary_range || "Salary hidden"}</span>
                  <span>{job.job_type || "full-time"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <CompanyProfileForm company={companyRecord || null} ownerId={user?.id || ""} />

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Why this matters</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>• A complete company profile gives candidates confidence before they click apply.</p>
              <p>• Better brand data makes your recruiter dashboard feel more like a real hiring workspace.</p>
              <p>• When you post jobs next, the company context appears everywhere automatically.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile checklist</div>
            <div className="space-y-3">
              <ChecklistItem label="Company name" done={Boolean(company?.name)} />
              <ChecklistItem label="Website" done={Boolean(company?.website)} />
              <ChecklistItem label="Logo" done={Boolean(company?.logo_url)} />
              <ChecklistItem label="Description" done={Boolean(company?.description)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl border border-border bg-secondary/20 p-2 text-primary">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/10 px-4 py-3 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className={done ? "text-green-500" : "text-muted-foreground"}>{done ? "Done" : "Pending"}</span>
    </div>
  );
}
