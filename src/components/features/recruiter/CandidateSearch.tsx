"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bookmark, Briefcase, ExternalLink, Github, MapPin, Search, Sparkles, Star, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateProfile, RecruiterJob } from "@/lib/recruiter-matching";

export type RankedCandidate = CandidateProfile & {
  score: number;
  fitLabel: string;
  matchingSkills: string[];
  missingSkills: string[];
  reasoning: string;
  nextStep: string;
};

export default function CandidateSearch({
  candidates,
  selectedJob,
  companyName,
  initialQuery = "",
}: {
  candidates: RankedCandidate[];
  selectedJob: RecruiterJob | null;
  companyName: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sortMode, setSortMode] = useState<"match" | "experience" | "recent">("match");
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id ?? null);
  const [shortlist, setShortlist] = useState<string[]>([]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCandidates = candidates
    .filter((candidate) => {
      if (!normalizedQuery) return true;

      const haystack = [
        candidate.full_name,
        candidate.headline,
        candidate.bio,
        candidate.location,
        candidate.current_company,
        candidate.current_role,
        candidate.skills?.join(" "),
        candidate.matchingSkills?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .sort((left, right) => {
      if (sortMode === "experience") {
        return (right.experience_years ?? 0) - (left.experience_years ?? 0);
      }

      if (sortMode === "recent") {
        return new Date(right.updated_at ?? 0).getTime() - new Date(left.updated_at ?? 0).getTime();
      }

      return right.score - left.score;
    });

  const activeCandidate =
    filteredCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? filteredCandidates[0] ?? null;

  const shortlistCount = candidates.filter((candidate) => shortlist.includes(candidate.id)).length;
  const strongCount = filteredCandidates.filter((candidate) => candidate.score >= 80).length;
  const averageExperience = filteredCandidates.length
    ? Math.round(
        filteredCandidates.reduce((total, candidate) => total + (candidate.experience_years ?? 0), 0) /
          filteredCandidates.length
      )
    : 0;

  const toggleShortlist = (candidateId: string) => {
    setShortlist((current) =>
      current.includes(candidateId) ? current.filter((value) => value !== candidateId) : [...current, candidateId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles size={14} /> AI candidate search
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Find talent that actually fits {companyName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Search by skill, role, company, or location. The ranking engine blends skill overlap, experience, and profile completeness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[360px] lg:grid-cols-4">
            <MetricCard label="Talent pool" value={candidates.length} />
            <MetricCard label="Strong fits" value={strongCount} />
            <MetricCard label="Avg years" value={averageExperience} />
            <MetricCard label="Shortlisted" value={shortlistCount} />
          </div>
        </div>

        {selectedJob && (
          <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Current job focus</div>
                <div className="mt-1 text-lg font-bold text-foreground">{selectedJob.title}</div>
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

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-muted-foreground" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/20 py-3 pl-11 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Search by name, skill, headline, company, or location"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SortButton label="Best match" active={sortMode === "match"} onClick={() => setSortMode("match")} />
            <SortButton label="Experience" active={sortMode === "experience"} onClick={() => setSortMode("experience")} />
            <SortButton label="Recent" active={sortMode === "recent"} onClick={() => setSortMode("recent")} />
          </div>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-10 text-center text-muted-foreground">
          No candidates matched your current search. Try a broader skill or remove a filter.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedCandidateId(candidate.id)}
                className={cn(
                  "w-full rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30",
                  activeCandidate?.id === candidate.id ? "border-primary/30 ring-2 ring-primary/15" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary/40 text-lg font-bold text-primary">
                      {candidate.avatar_url ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${candidate.avatar_url})` }}
                          role="img"
                          aria-label={candidate.full_name || "Candidate"}
                        />
                      ) : (
                        <UserCircle2 size={28} />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{candidate.full_name || "Anonymous candidate"}</h3>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {candidate.score}% {candidate.fitLabel}
                        </span>
                        {shortlist.includes(candidate.id) && (
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">{candidate.headline || candidate.current_role || "Open to new opportunities"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} />
                          {candidate.current_role || "Flexible role"}
                          {candidate.current_company ? ` at ${candidate.current_company}` : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {candidate.location || "Location not set"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BadgeCheck size={14} />
                          {candidate.experience_years ?? "-"} yrs experience
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleShortlist(candidate.id);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                      shortlist.includes(candidate.id)
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                        : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    <Bookmark size={14} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.matchingSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.missingSkills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Needs {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 h-2 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all"
                    style={{ width: `${candidate.score}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeCandidate ? (
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary/40 text-primary">
                    {activeCandidate.avatar_url ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${activeCandidate.avatar_url})` }}
                        role="img"
                        aria-label={activeCandidate.full_name || "Candidate"}
                      />
                    ) : (
                      <UserCircle2 size={32} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-bold text-foreground">{activeCandidate.full_name || "Anonymous candidate"}</h3>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {activeCandidate.score}% {activeCandidate.fitLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeCandidate.headline || activeCandidate.current_role || "Ready for a new role"}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {activeCandidate.current_role || "Flexible role"}
                      {activeCandidate.current_company ? ` at ${activeCandidate.current_company}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <InfoTile label="Location" value={activeCandidate.location || "Not listed"} />
                  <InfoTile label="Experience" value={`${activeCandidate.experience_years ?? 0} years`} />
                  <InfoTile label="Resume" value={activeCandidate.resume_url ? "Uploaded" : "Missing"} />
                  <InfoTile label="Updated" value={activeCandidate.updated_at ? new Date(activeCandidate.updated_at).toLocaleDateString() : "Recently"} />
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Why this person stands out</div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeCandidate.reasoning}</p>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Matching skills</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeCandidate.matchingSkills.length > 0 ? (
                        activeCandidate.matchingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No direct overlaps found, but the profile is still worth reviewing.</span>
                      )}
                    </div>
                  </div>

                  {activeCandidate.missingSkills.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gaps to validate</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeCandidate.missingSkills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={activeCandidate.resume_url || "#"}
                    target={activeCandidate.resume_url ? "_blank" : undefined}
                    rel={activeCandidate.resume_url ? "noreferrer" : undefined}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
                      activeCandidate.resume_url
                        ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                        : "pointer-events-none cursor-not-allowed border-border bg-secondary/20 text-muted-foreground"
                    )}
                  >
                    <ExternalLink size={16} />
                    View resume
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(activeCandidate.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
                      shortlist.includes(activeCandidate.id)
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                        : "border-border bg-secondary/20 text-foreground hover:border-primary/20 hover:text-primary"
                    )}
                  >
                    <Star size={16} fill={shortlist.includes(activeCandidate.id) ? "currentColor" : "none"} />
                    {shortlist.includes(activeCandidate.id) ? "Shortlisted" : "Shortlist"}
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Recommended next step</div>
                  <p className="mt-1 text-sm font-medium text-foreground">{activeCandidate.nextStep}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeCandidate.linkedin_url && (
                    <a
                      href={activeCandidate.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/20 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/20 hover:text-primary"
                    >
                      LinkedIn
                    </a>
                  )}
                  {activeCandidate.github_url && (
                    <a
                      href={activeCandidate.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/20 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/20 hover:text-primary"
                    >
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {activeCandidate.phone && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/20 px-3 py-2 text-xs font-bold text-muted-foreground">
                      Contact on file
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/10 p-10 text-center text-muted-foreground">
                Select a candidate to inspect their full profile.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-bold transition-colors",
        active ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}
