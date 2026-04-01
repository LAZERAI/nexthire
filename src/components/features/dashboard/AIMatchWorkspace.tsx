"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, BrainCircuit, Building2, CheckCircle2, ChevronRight, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildProfileNarrative, calculateProfileStrength, CandidateProfile, RecruiterJob } from "@/lib/recruiter-matching";

type Match = RecruiterJob & {
  similarity: number;
  reasoning?: string;
  gapAnalysis?: string;
  matchedSkills?: string[];
  company?: string | null;
  fitLabel?: string;
};

type InsightItem = {
  id: string;
  reasoning?: string;
  gapAnalysis?: string;
  matchedSkills?: string[];
};

const ANALYSIS_STEPS = [
  { label: "Summarizing your profile", icon: <Sparkles size={16} /> },
  { label: "Generating embeddings", icon: <Zap size={16} /> },
  { label: "Running semantic search", icon: <Target size={16} /> },
  { label: "Writing AI insights", icon: <BrainCircuit size={16} /> },
];

const FALLBACK_JOBS: Match[] = [
  {
    id: "ai-fallback-1",
    title: "AI Product Engineer",
    company: "NexHire Labs",
    location: "Remote",
    salary_range: "₹18L - ₹24L",
    job_type: "full-time",
    experience_level: "mid",
    work_mode: "remote",
    skills_required: ["TypeScript", "LLM Ops", "Next.js", "Product Thinking"],
    description: "Shape AI features that sit directly inside the product experience.",
    similarity: 0.78,
  },
  {
    id: "ai-fallback-2",
    title: "Full Stack Platform Engineer",
    company: "NexHire Labs",
    location: "Kochi, India",
    salary_range: "₹14L - ₹20L",
    job_type: "full-time",
    experience_level: "mid",
    work_mode: "hybrid",
    skills_required: ["React", "PostgreSQL", "Supabase", "Cloud Functions"],
    description: "Build recruiter workflows, candidate surfaces, and internal tooling.",
    similarity: 0.73,
  },
  {
    id: "ai-fallback-3",
    title: "Growth Data Analyst",
    company: "NexHire Labs",
    location: "Remote",
    salary_range: "₹12L - ₹16L",
    job_type: "full-time",
    experience_level: "entry",
    work_mode: "remote",
    skills_required: ["Analytics", "SQL", "Funnel Analysis", "Experimentation"],
    description: "Help the team understand activation, retention, and matching quality.",
    similarity: 0.69,
  },
  {
    id: "ai-fallback-4",
    title: "Technical Recruiter",
    company: "NexHire Labs",
    location: "Bengaluru, India",
    salary_range: "₹10L - ₹14L",
    job_type: "full-time",
    experience_level: "mid",
    work_mode: "hybrid",
    skills_required: ["Sourcing", "Candidate Experience", "Talent Market Mapping"],
    description: "Run higher-quality hiring loops with a more humane candidate journey.",
    similarity: 0.66,
  },
];

export default function AIMatchWorkspace({
  profile,
  fallbackJobs,
}: {
  profile: CandidateProfile;
  fallbackJobs: RecruiterJob[];
}) {
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Match[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoRun, setHasAutoRun] = useState(false);

  const profileStrength = calculateProfileStrength(profile);
  const profileText = buildProfileNarrative(profile);
  const profileWords = profileText.split(/\s+/).filter(Boolean).length;
  const profileReady = profileStrength >= 60;

  const normalizeFallbackJobs = (jobs: RecruiterJob[]): Match[] =>
    jobs.map((job, index) => ({
      ...job,
      similarity: Math.max(0.55, 0.82 - index * 0.04),
      fitLabel: index === 0 ? "Top fallback" : "Fallback role",
      reasoning: `Fallback role for ${job.title}. Semantic ranking is temporarily unavailable, so this is based on the strongest live opening signal.`,
      gapAnalysis: "Seed the jobs table with embeddings to unlock deeper AI ranking.",
      matchedSkills: job.skills_required?.slice(0, 3) || [],
      company: job.company_name || job.company || null,
    }));

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setError(null);
    setWarning(null);
    setResults([]);

    try {
      if (!profileText.trim()) {
        throw new Error("Profile information is too sparse to analyze.");
      }

      setAnalysisStep(0);
      const embeddingResponse = await fetch("/api/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: profileText }),
      });

      const embeddingData = await embeddingResponse.json();
      if (embeddingData.error) {
        throw new Error(embeddingData.error);
      }

      setAnalysisStep(1);
      const matchResponse = await fetch("/api/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedding: embeddingData.embedding }),
      });

      const matchData: { matches?: Match[]; warning?: string | null; error?: string | null } = await matchResponse.json();
      let matches: Match[] = Array.isArray(matchData.matches) ? matchData.matches : [];
      let matchWarning = matchData.warning || null;

      if (matchData.error && matches.length === 0) {
        matchWarning = matchWarning || "Semantic matching is unavailable right now, so we are using the strongest available roles.";
      }

      if (matches.length === 0) {
        matches = normalizeFallbackJobs(fallbackJobs.length > 0 ? fallbackJobs : FALLBACK_JOBS);
        matchWarning = matchWarning || "No semantic matches yet. Seed job embeddings to unlock deeper ranking.";
      }

      setWarning(matchWarning);

      setAnalysisStep(2);
      const insightsResponse = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: profileText, jobs: matches }),
      });

      const insightsData: { insights?: InsightItem[] } = await insightsResponse.json();
      const enrichedResults = matches.map((match: Match) => {
        const insight = insightsData?.insights?.find((item) => item.id === match.id);

        return {
          ...match,
          reasoning: insight?.reasoning || `Strong alignment with ${match.title}.`,
          gapAnalysis: insight?.gapAnalysis || "No major blockers surfaced from the profile scan.",
          matchedSkills: insight?.matchedSkills || match.skills_required?.slice(0, 3) || [],
        };
      });

      setResults(enrichedResults);
      setAnalysisStep(3);
    } catch (analysisError: unknown) {
      console.error("Dashboard AI match error:", analysisError);
      setError(analysisError instanceof Error ? analysisError.message : "Unable to analyze profile right now.");
      setResults(normalizeFallbackJobs(fallbackJobs.length > 0 ? fallbackJobs : FALLBACK_JOBS));
      setWarning("Showing fallback roles while we recover the semantic match flow.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!hasAutoRun) {
      setHasAutoRun(true);
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAutoRun]);

  const matchCount = results.length;
  const topMatch = results[0];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
        <div className="relative border-b border-border bg-gradient-to-br from-primary/10 via-background to-secondary/40 px-6 py-8 md:px-8">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <BrainCircuit size={14} /> Profile-driven AI match
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Your profile, ranked against live roles.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  This view uses the profile you already saved to create a sharper, more actionable match list than a generic search screen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[420px] lg:grid-cols-4">
              <StatPill label="Profile strength" value={`${profileStrength}%`} />
              <StatPill label="Words scanned" value={profileWords} />
              <StatPill label="Live matches" value={matchCount} />
              <StatPill label="Ready" value={profileReady ? "Yes" : "Soon"} />
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-2xl border border-border bg-secondary/15 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile snapshot</div>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">{profile.full_name || "Candidate profile"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{profile.headline || "Add a headline to sharpen the match engine."}</p>
                </div>
                <div className="rounded-xl border border-border bg-background px-4 py-3 text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fit signal</div>
                  <div className="text-lg font-bold text-foreground">{profileStrength}%</div>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <InfoLine label="Role" value={profile.current_role || "Not set"} />
                <InfoLine label="Company" value={profile.current_company || "Not set"} />
                <InfoLine label="Location" value={profile.location || "Not set"} />
                <InfoLine label="Experience" value={profile.experience_years !== null ? `${profile.experience_years} years` : "Not set"} />
                <InfoLine label="Resume" value={profile.resume_url ? "Uploaded" : "Missing"} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(profile.skills || []).slice(0, 8).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                  >
                    {skill}
                  </span>
                ))}
                {(profile.skills || []).length === 0 && (
                  <span className="text-sm text-muted-foreground">Add skills on your profile to improve matching.</span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
                  Edit profile <ChevronRight size={14} />
                </Link>
                <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary">
                  Browse jobs <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">How this works</div>
              <div className="mt-4 space-y-3">
                {ANALYSIS_STEPS.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3 text-sm">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                        index < analysisStep
                          ? "border-green-500 bg-green-500 text-white"
                          : index === analysisStep
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground"
                      )}
                    >
                      {index < analysisStep ? <CheckCircle2 size={12} /> : step.icon}
                    </div>
                    <span
                      className={cn(
                        index < analysisStep
                          ? "font-medium text-green-500"
                          : index === analysisStep
                            ? "font-bold text-primary"
                            : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Refresh matches
              </button>

              {warning && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  {warning}
                </div>
              )}

              {error && !warning && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            {topMatch ? (
              <div className="rounded-2xl border border-border bg-secondary/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top result</div>
                    <h3 className="mt-1 text-2xl font-bold text-foreground">{topMatch.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Building2 size={14} />
                      <span>{topMatch.company || topMatch.company_name || "Company not listed"}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{topMatch.location || "Remote"}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{topMatch.salary_range || "Salary not disclosed"}</span>
                    </div>
                  </div>

                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                    {Math.round(topMatch.similarity * 100)}% semantic match
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI insight</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topMatch.reasoning || "This is the strongest available role based on your profile signal."}</p>
                  {topMatch.gapAnalysis && (
                    <div className="mt-3 rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
                      <span className="font-bold text-destructive">Gap analysis:</span> {topMatch.gapAnalysis}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(topMatch.matchedSkills || topMatch.skills_required?.slice(0, 3) || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
                    View job <ChevronRight size={14} />
                  </Link>
                  <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:text-primary">
                    Improve profile <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-10 text-center text-muted-foreground">
                Your AI match results will appear here once the scan finishes.
              </div>
            )}

            <div className="grid gap-4">
              {isAnalyzing && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 text-sm font-bold text-foreground">Running analysis</div>
                  <div className="space-y-3">
                    {ANALYSIS_STEPS.map((step, index) => (
                      <div key={step.label} className="flex items-center gap-3 text-sm">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                            index <= analysisStep ? "border-primary text-primary" : "border-border text-muted-foreground"
                          )}
                        >
                          {index < analysisStep ? <CheckCircle2 size={12} /> : index + 1}
                        </div>
                        <span className={index <= analysisStep ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.map((job) => (
                <div key={job.id} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-bold text-foreground group-hover:text-primary">{job.title}</h4>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {Math.round(job.similarity * 100)}% semantic match
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {job.company || job.company_name || "Company not listed"} • {job.salary_range || "Compensation undisclosed"}
                      </div>
                    </div>

                    <div className="rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {job.fitLabel || "Ranked"}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="flex items-start gap-3">
                      <BrainCircuit size={18} className="mt-0.5 shrink-0 text-primary" />
                      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        <p>
                          <span className="font-bold text-foreground">Why it fits:</span> {job.reasoning || "The role is a strong semantic match for your profile."}
                        </p>
                        {job.gapAnalysis && (
                          <p>
                            <span className="font-bold text-destructive">Gap check:</span> {job.gapAnalysis}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.matchedSkills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills_required?.filter((skill) => !job.matchedSkills?.includes(skill)).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {error && warning && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                  <AlertCircle className="mr-2 inline-block" size={16} /> {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 px-3 py-3 text-center shadow-sm backdrop-blur-sm">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
