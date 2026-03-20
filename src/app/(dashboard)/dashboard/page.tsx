import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { 
  Briefcase, 
  FileText, 
  Eye, 
  Zap, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Fetch Applications Count
  const { count: applicationsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', user?.id);

  // Fetch Recent Jobs (Mock Recommendations)
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url)')
    .limit(3)
    .order('created_at', { ascending: false });

  // Calculate Profile Completion (Simple Logic)
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 20; // Base for existing
    if (profile.full_name) score += 20;
    if (profile.headline) score += 20;
    if (profile.bio) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 20;
    return score;
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ai-match">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-primary/90 transition-all">
              <Zap size={18} />
              <span>AI Resume Scan</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Profile Completion</span>
          <span className="font-bold text-primary">{completionPercent}%</span>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${completionPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
          </div>
        </div>
        {completionPercent < 100 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-500/90 bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
            <AlertCircle size={16} />
            <span>Complete your profile to unlock 3x more AI matches.</span>
            <Link href="/profile" className="ml-auto font-bold hover:underline">Complete Now →</Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Briefcase />} 
          label="Applications" 
          value={applicationsCount || 0} 
          trend="+2 this week"
        />
        <StatCard 
          icon={<FileText />} 
          label="Saved Jobs" 
          value={12} 
          trend="Mock Data"
        />
        <StatCard 
          icon={<Eye />} 
          label="Profile Views" 
          value={48} 
          trend="+15% vs last mo"
        />
        <StatCard 
          icon={<Zap />} 
          label="Avg Match Score" 
          value="85%" 
          trend="Top 10%"
          highlight
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <SparklesIcon /> Recommended for You
            </h2>
            <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.companies?.name || 'Unknown Company'} • {job.location}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                      <Zap size={12} fill="currentColor" />
                      {Math.floor(Math.random() * (99 - 88 + 1) + 88)}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills_required?.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/5">
                <p className="text-muted-foreground mb-4">No jobs found yet.</p>
                <Link href="/jobs" className="px-4 py-2 bg-secondary border border-border rounded-md text-sm font-bold hover:bg-secondary/80">
                  Browse Jobs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ActionButton icon={<FileText size={18} />} label="Update Resume" />
              <ActionButton icon={<CheckCircle2 size={18} />} label="View Applied Jobs" />
              <ActionButton icon={<Briefcase size={18} />} label="Manage Alerts" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
            <h3 className="font-bold text-primary mb-2">Pro Tip</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adding a "Headline" to your profile increases recruiter visibility by 40%.
            </p>
            <button className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, highlight = false }: any) {
  return (
    <div className={cn(
      "p-5 rounded-xl border transition-all",
      highlight 
        ? "bg-primary/5 border-primary/20" 
        : "bg-card border-border hover:border-border/80"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          highlight ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          highlight ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-500"
        )}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold mb-1 text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

function ActionButton({ icon, label }: any) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground">
      {icon}
      <span>{label}</span>
      <ArrowRight size={14} className="ml-auto opacity-50" />
    </button>
  );
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
