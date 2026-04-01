import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { buildCandidateRanking, type CandidateProfile } from "@/lib/recruiter-matching";
import { 
  Briefcase, 
  Users, 
  Zap, 
  PlusCircle, 
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  created_at: string;
  location: string | null;
  job_type: string | null;
  skills_required: string[] | null;
  experience_level: string | null;
  work_mode: string | null;
};

type RankedCandidate = CandidateProfile & ReturnType<typeof buildCandidateRanking>;

export default async function RecruiterDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get Company ID
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, logo_url, website, description')
    .eq('owner_id', user?.id)
    .maybeSingle();
  const companyRecord = company as CompanyRecord | null;

  // Fetch Jobs Stats
  let activeJobsCount = 0;
  let totalApplications = 0;
  let activeJobs: JobRow[] = [];
  let topCandidates: RankedCandidate[] = [];

  if (companyRecord) {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyRecord.id);
    activeJobsCount = count || 0;

    // Fetch active jobs with application counts
    // Note: Supabase doesn't support deep count relations in one query easily without RPC, 
    // so we'll fetch jobs then count applications or use a view. 
    // For MVP, simplistic fetch.
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, description, created_at, location, job_type, skills_required, experience_level, work_mode')
      .eq('company_id', companyRecord.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    activeJobs = (jobs || []) as JobRow[];

    const jobIds = activeJobs.map((job) => job.id);

    if (jobIds.length > 0) {
      const { count: applicationsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds);

      totalApplications = applicationsCount || 0;
    }

    const { data: candidatePool } = await supabase
      .from('profiles')
      .select('id, full_name, headline, bio, location, experience_years, skills, resume_url, linkedin_url, github_url, current_company, current_role, avatar_url, updated_at')
      .eq('role', 'candidate')
      .order('updated_at', { ascending: false })
      .limit(12);

    const focusJob = activeJobs[0]
      ? {
          ...activeJobs[0],
          title: activeJobs[0].title,
          description: activeJobs[0].description,
          location: activeJobs[0].location,
          salary_range: null,
          job_type: activeJobs[0].job_type,
          experience_level: activeJobs[0].experience_level,
          work_mode: activeJobs[0].work_mode,
          skills_required: activeJobs[0].skills_required,
          company: companyRecord.name,
          company_name: companyRecord.name,
        }
      : null;

    if (candidatePool) {
      topCandidates = (candidatePool as CandidateProfile[])
        .map((candidate) => {
          if (focusJob) {
            return {
              ...candidate,
              ...buildCandidateRanking(focusJob, candidate),
            };
          }

          const skills = candidate.skills || [];
          const score = Math.min((skills.length * 7) + (candidate.experience_years || 0) * 4 + (candidate.resume_url ? 10 : 0), 96);

          return {
            ...candidate,
            score,
            fitLabel: score >= 85 ? 'Strong fit' : 'Potential fit',
            matchingSkills: skills.slice(0, 3),
            missingSkills: [],
            reasoning: 'This candidate has a strong general profile and is worth a deeper look.',
            nextStep: 'Open candidate profile',
          };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 3);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Recruiter Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your hiring pipeline and find top talent.</p>
        </div>
        <Link href="/recruiter/post-job" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <PlusCircle size={18} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Briefcase />} 
          label="Active Jobs" 
          value={activeJobsCount} 
          color="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <StatCard 
          icon={<Users />} 
          label="Total Applicants" 
          value={totalApplications || "0"} 
          color="text-purple-500 bg-purple-500/10 border-purple-500/20"
        />
        <StatCard 
          icon={<Zap />} 
          label="Avg Match Score" 
          value={topCandidates[0] ? `${topCandidates[0].score}%` : "82%"} 
          color="text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
        />
        <StatCard 
          icon={<TrendingUp />} 
          label="Views this week" 
          value={124} 
          color="text-green-500 bg-green-500/10 border-green-500/20"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column: Active Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Briefcase size={20} className="text-primary" /> Active Job Postings
            </h2>
            <Link href="/recruiter/my-jobs" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <div key={job.id} className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{job.location}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="capitalize">{job.job_type}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{totalApplications || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Applicants</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex gap-4">
                    <Link href={`/recruiter/jobs/${job.id}`} className="text-sm font-bold text-primary hover:underline">Manage</Link>
                    <Link href={`/recruiter/candidates?jobId=${job.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">Find Candidates</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-secondary/5">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-1">No active jobs</h3>
                <p className="text-muted-foreground mb-4">Post your first job to start finding talent.</p>
                <Link href="/recruiter/post-job" className="text-primary font-bold hover:underline">
                  Post a Job Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Top Candidates */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap size={18} className="text-primary" /> Top Matching Talent
            </h3>
            <div className="space-y-4">
              {topCandidates.length > 0 ? (
                topCandidates.map((candidate: RankedCandidate) => (
                  <div key={candidate.id} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-primary/20 to-purple-500/20 font-bold text-foreground">
                      {candidate.avatar_url ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${candidate.avatar_url})` }}
                          role="img"
                          aria-label={candidate.full_name || 'Candidate'}
                        />
                      ) : (
                        (candidate.full_name || 'U').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold text-foreground">{candidate.full_name || "Anonymous candidate"}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {candidate.score}% match{candidate.current_role ? ` • ${candidate.current_role}` : ""}
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                  Add a job first to unlock candidate ranking.
                </div>
              )}
            </div>
            <Link href="/recruiter/candidates" className="mt-4 block w-full rounded-lg border border-primary/20 py-2 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/5">
              Search Candidates
            </Link>
          </div>

          <div className="bg-secondary/20 border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/recruiter/company" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                Update Company Profile
              </Link>
              <Link href="/recruiter/candidates" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                Search Candidates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}
