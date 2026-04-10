"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Globe,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/toast";

type JobCompany = {
  name: string | null;
  logo_url: string | null;
  website: string | null;
};

type DbJobRow = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  experience_level: string | null;
  work_mode: string | null;
  skills_required: string[] | null;
  created_at: string;
  companies: JobCompany | JobCompany[] | null;
};

type PublicJob = {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  website: string | null;
  location: string;
  salary: string;
  type: string;
  mode: string;
  level: string;
  postedAt: string;
  tags: string[];
  description: string;
};

type SessionUser = {
  id: string;
  email?: string | null;
};

function normalizeCompany(company: JobCompany | JobCompany[] | null | undefined): JobCompany | null {
  if (!company) {
    return null;
  }

  return Array.isArray(company) ? company[0] ?? null : company;
}

function formatRelativeTime(dateString: string) {
  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) {
    return "Just now";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
  if (elapsedSeconds < 60) {
    return `${Math.max(1, elapsedSeconds)}s ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`;
  }

  return `${Math.floor(elapsedDays / 7)}w ago`;
}

function prettifyLabel(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildJob(row: DbJobRow): PublicJob {
  const company = normalizeCompany(row.companies);

  return {
    id: row.id,
    title: row.title,
    company: company?.name || "Independent",
    companyLogo: company?.logo_url || null,
    website: company?.website || null,
    location: row.location || "Remote",
    salary: row.salary_range || "Not disclosed",
    type: prettifyLabel(row.job_type),
    mode: prettifyLabel(row.work_mode),
    level: prettifyLabel(row.experience_level),
    postedAt: formatRelativeTime(row.created_at),
    tags: (row.skills_required || []).slice(0, 6),
    description: row.description,
  };
}

async function fetchJobs() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, description, location, salary_range, job_type, experience_level, work_mode, skills_required, created_at, companies(name, logo_url, website)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DbJobRow[];
}

export default function PublicJobsBoard() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [jobsData, userData] = await Promise.all([fetchJobs(), supabase.auth.getUser()]);

        if (!isMounted) {
          return;
        }

        const mappedJobs = jobsData.map(buildJob);
        setJobs(mappedJobs);
        setSelectedJob((current) => {
          if (current) {
            return mappedJobs.find((job) => job.id === current.id) ?? mappedJobs[0] ?? null;
          }

          return mappedJobs[0] ?? null;
        });
        setLoggedInUser(userData.data.user ? { id: userData.data.user.id, email: userData.data.user.email } : null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load jobs.";
        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedInUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return jobs;
    }

    return jobs.filter((job) => {
      const searchableText = [job.title, job.company, job.location, job.description, job.type, job.mode, job.level, ...job.tags]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [jobs, searchQuery]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const remoteJobs = jobs.filter((job) => job.mode.toLowerCase().includes("remote")).length;
    const companies = new Set(jobs.map((job) => job.company)).size;
    const fullTimeJobs = jobs.filter((job) => job.type.toLowerCase().includes("full")).length;

    return { totalJobs, remoteJobs, companies, fullTimeJobs };
  }, [jobs]);

  const handleApply = async () => {
    if (!loggedInUser) {
      toast("Please sign in to apply for this job", "info");
      router.push("/login?returnUrl=/jobs");
      return;
    }

    if (!selectedJob) {
      return;
    }

    setIsApplying(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("applications").insert({
        job_id: selectedJob.id,
        candidate_id: loggedInUser.id,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast("You have already applied for this position.", "info");
        } else {
          throw error;
        }
      } else {
        toast("Application submitted successfully!", "success");
        setSelectedJob(null);
      }
    } catch (error: any) {
      toast(error.message || "Failed to submit application", "error");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-20 page-transition">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Find Your Next Challenge</h1>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title, skills, company, or location..."
              className="w-full bg-secondary/50 border border-border rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {loadError && (
          <div className="max-w-5xl mx-auto mb-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLoadError(null)}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Live Jobs", value: stats.totalJobs, icon: Briefcase },
            { label: "Remote Roles", value: stats.remoteJobs, icon: Globe },
            { label: "Companies", value: stats.companies, icon: Building2 },
            { label: "Full-Time", value: stats.fullTimeJobs, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</span>
                <stat.icon size={16} className="text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{isLoading ? "--" : stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] text-foreground max-w-6xl mx-auto">
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="h-12 w-12 rounded-xl bg-secondary" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-40 rounded bg-secondary" />
                        <div className="h-3 w-24 rounded bg-secondary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 rounded bg-secondary" />
                      <div className="h-4 w-full rounded bg-secondary" />
                      <div className="h-4 w-11/12 rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className={cn(
                    "w-full text-left rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg",
                    selectedJob?.id === job.id ? "border-primary/40 shadow-[0_0_0_1px_rgba(59,130,246,0.18)]" : "border-border"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                            {job.type}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                            {job.mode}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                            {job.level}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-foreground truncate">{job.title}</h2>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>{job.company}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between sm:flex-col sm:items-end gap-3">
                      <span className="text-sm font-bold text-foreground">{job.salary}</span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{job.postedAt}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mt-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mt-5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-primary">
                    <span>View details</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <AlertCircle size={40} className="mx-auto text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-foreground mb-2">No jobs matched your search</h3>
                <p className="text-muted-foreground">Try a different keyword or clear the search to see all live jobs.</p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-border bg-card p-6 shadow-sm">
            {selectedJob ? (
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/15 mb-3">
                      <Briefcase size={12} />
                      Live Role
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedJob.title}</h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5"><Building2 size={14} /> {selectedJob.company}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <DetailChip icon={<MapPin size={14} />} label={selectedJob.location} />
                  <DetailChip icon={<DollarSign size={14} />} label={selectedJob.salary} />
                  <DetailChip icon={<BarChart3 size={14} />} label={selectedJob.level} />
                  <DetailChip icon={<Clock size={14} />} label={selectedJob.postedAt} />
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Work Mode</h3>
                    <p className="text-sm text-foreground font-medium">{selectedJob.mode}</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Job Type</h3>
                    <p className="text-sm text-foreground font-medium">{selectedJob.type}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                  {isApplying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isApplying ? "Submitting..." : "Apply Now"}
                </button>

                {selectedJob.website && (
                  <a
                    href={selectedJob.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary text-foreground font-semibold border border-border hover:bg-secondary/80 transition-colors"
                  >
                    Visit Company Site
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Select a job to see details</h3>
                <p className="text-muted-foreground">Pick a live role from the list to view the full description and apply.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-3 py-3 flex items-center gap-2 text-sm text-foreground font-medium">
      <span className="text-primary">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
