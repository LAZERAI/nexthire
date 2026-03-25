import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { 
  Briefcase, 
  Users, 
  Zap, 
  PlusCircle, 
  ArrowRight, 
  Search,
  Building2,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RecruiterDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get Company ID
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('owner_id', user?.id)
    .single();

  // Fetch Jobs Stats
  let activeJobsCount = 0;
  let totalApplications = 0;
  let activeJobs: any[] = [];

  if (company) {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id);
    activeJobsCount = count || 0;

    // Fetch active jobs with application counts
    // Note: Supabase doesn't support deep count relations in one query easily without RPC, 
    // so we'll fetch jobs then count applications or use a view. 
    // For MVP, simplistic fetch.
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, created_at, location, type:job_type')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    activeJobs = jobs || [];

    // Get total applications count (simplified)
    // Real app would sum counts from jobs
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
        <Link href="/recruiter/post-job">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <PlusCircle size={18} />
            <span>Post New Job</span>
          </button>
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
          value="82%" 
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
                        <span className="capitalize">{job.type}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">0</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Applicants</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex gap-4">
                    <Link href={`/recruiter/jobs/${job.id}`} className="text-sm font-bold text-primary hover:underline">Manage</Link>
                    <Link href={`/recruiter/jobs/${job.id}/candidates`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">Find Candidates</Link>
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
              <Sparkles size={18} className="text-primary" /> Top Matching Talent
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-border flex items-center justify-center font-bold text-foreground">
                    C{i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">Senior React Dev</div>
                    <div className="text-xs text-muted-foreground truncate">98% Match for "Frontend Engineer"</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
              Search Candidates
            </button>
          </div>

          <div className="bg-secondary/20 border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/recruiter/company" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                Update Company Profile
              </Link>
              <Link href="/recruiter/settings" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                Manage Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
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
