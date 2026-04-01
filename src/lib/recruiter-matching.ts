export type CandidateProfile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[] | null;
  resume_url: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  phone?: string | null;
  current_company: string | null;
  current_role: string | null;
  avatar_url: string | null;
  updated_at?: string | null;
};

export type RecruiterJob = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  experience_level: string | null;
  work_mode: string | null;
  skills_required: string[] | null;
  company?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  company_website?: string | null;
  created_at?: string | null;
};

export function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeSkills(skills: string[] | null | undefined) {
  return (skills ?? [])
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function buildProfileNarrative(profile: CandidateProfile) {
  const lines = [
    `Candidate: ${profile.full_name || "Anonymous candidate"}`,
    profile.headline ? `Headline: ${profile.headline}` : null,
    profile.current_role || profile.current_company
      ? `Current role: ${profile.current_role || "Not specified"} at ${profile.current_company || "Not specified"}`
      : null,
    profile.location ? `Location: ${profile.location}` : null,
    Number.isFinite(profile.experience_years) ? `Experience: ${profile.experience_years} years` : null,
    normalizeSkills(profile.skills).length > 0 ? `Skills: ${normalizeSkills(profile.skills).join(", ")}` : null,
    profile.bio ? `Bio: ${profile.bio}` : null,
    profile.resume_url ? "Resume: Available" : "Resume: Not uploaded",
    profile.linkedin_url ? `LinkedIn: ${profile.linkedin_url}` : null,
    profile.github_url ? `GitHub: ${profile.github_url}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function calculateProfileStrength(profile: CandidateProfile) {
  let score = 0;

  if (profile.full_name) score += 20;
  if (profile.headline) score += 20;
  if (profile.bio) score += 20;
  if (normalizeSkills(profile.skills).length > 0) score += 20;
  if (profile.resume_url) score += 15;
  if (profile.location) score += 5;

  return Math.min(score, 100);
}

export function buildCandidateRanking(job: RecruiterJob, candidate: CandidateProfile) {
  const jobSkills = normalizeSkills(job.skills_required);
  const candidateSkills = normalizeSkills(candidate.skills);
  const matchingSkills = jobSkills.filter((skill) =>
    candidateSkills.some((candidateSkill) => {
      const normalizedSkill = normalizeText(skill);
      const normalizedCandidateSkill = normalizeText(candidateSkill);

      return (
        normalizedSkill === normalizedCandidateSkill ||
        normalizedCandidateSkill.includes(normalizedSkill) ||
        normalizedSkill.includes(normalizedCandidateSkill)
      );
    })
  );

  const missingSkills = jobSkills.filter((skill) => !matchingSkills.includes(skill));
  const skillCoverage = jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : Math.min(candidateSkills.length / 10, 1);

  let experienceScore = 0.65;
  if (Number.isFinite(candidate.experience_years ?? NaN)) {
    const years = candidate.experience_years ?? 0;

    if (job.experience_level === "senior") {
      experienceScore = Math.min(years / 8, 1);
    } else if (job.experience_level === "mid") {
      experienceScore = years >= 3 ? 1 : Math.max(years / 3, 0.45);
    } else if (job.experience_level === "entry") {
      experienceScore = years <= 2 ? 1 : Math.max(0.55, 1 - (years - 2) * 0.1);
    } else {
      experienceScore = Math.min(years / 5, 1);
    }
  }

  let locationScore = 0.72;
  const candidateLocation = normalizeText(candidate.location);
  const jobLocation = normalizeText(job.location);
  const workMode = normalizeText(job.work_mode);

  if (workMode === "remote") {
    locationScore = 1;
  } else if (!candidateLocation || !jobLocation) {
    locationScore = 0.78;
  } else if (candidateLocation === jobLocation) {
    locationScore = 1;
  } else if (
    candidateLocation.includes(jobLocation.split(",")[0] ?? "") ||
    jobLocation.includes(candidateLocation.split(",")[0] ?? "")
  ) {
    locationScore = 0.9;
  }

  const profileSignals = [candidate.resume_url, candidate.linkedin_url, candidate.github_url].filter(Boolean).length / 3;
  const score = Math.round((skillCoverage * 0.58 + experienceScore * 0.22 + locationScore * 0.12 + profileSignals * 0.08) * 100);

  const fitLabel =
    score >= 90 ? "Exceptional fit" : score >= 80 ? "Strong fit" : score >= 70 ? "Promising" : "Needs review";

  const reasoning = matchingSkills.length > 0
    ? `Matches ${matchingSkills.slice(0, 3).join(", ")} and brings ${candidate.experience_years ?? "unknown"} years of experience into a ${job.experience_level || "flexible"} role.`
    : `The profile shows adjacent experience, but the role will need validation around core skills and scope.`;

  const nextStep =
    score >= 85
      ? "Invite to hiring manager screen"
      : score >= 75
        ? "Schedule a recruiter call"
        : "Review portfolio and source more evidence";

  return {
    score,
    fitLabel,
    matchingSkills,
    missingSkills,
    reasoning,
    nextStep,
  };
}
