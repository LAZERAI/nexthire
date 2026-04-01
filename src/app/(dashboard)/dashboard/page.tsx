import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { 
  Briefcase, 
  FileText, 
  Eye, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  MapPin,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch Profile & Stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const { count: applicationsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', user?.id);

  // Fetch Applications with details
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      id, status, created_at,
      jobs (title, companies(name))
    `)
    .eq('candidate_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Mock Recommendations (Replace with vector search later)
  const { data: recommendedJobsRaw } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url)')
    .limit(3);

  const MOCK_TOP_MATCHES = [
    { id: 'mj1', title: 'AI Engineer - Coderzon', companies: { name: 'Coderzon' }, location: 'Kochi', match: 88 },
    { id: 'mj2', title: 'ML Ops Engineer - Coderzon', companies: { name: 'Coderzon' }, location: 'Bengaluru', match: 82 },
    { id: 'mj3', title: 'Data Scientist - Coderzon', companies: { name: 'Coderzon' }, location: 'Remote', match: 76 },
  ];

  const recommendedJobs = (recommendedJobsRaw && recommendedJobsRaw.length > 0)
    ? recommendedJobsRaw.map((job: any) => ({ ...job, match: Math.floor(Math.random() * 15) + 78 }))
    : MOCK_TOP_MATCHES;

  // Calculate Profile Completion
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.full_name) score += 20;
    if (profile.headline) score += 20;
    if (profile.bio) score += 20;
    if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 20;
    if (profile.resume_url) score += 20;
    return score;
  };

  const completionPercent = calculateCompletion();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : null;
  const greeting = firstName ? `Good morning, ${firstName} 👋` : 'Good morning! 👋';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="text-muted-foreground mt-1">
            You have <span className="text-primary font-bold">{applicationsCount || 0} active applications</span>. Let's find your next win.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile" className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-bold hover:bg-secondary/80 transition-colors">
            Edit Profile
          </Link>
          <Link href="/dashboard/ai-match" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
            <Zap size={16} /> AI Scan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Briefcase />} 
          label="Applications Sent" 
          value={applicationsCount || 0} 
          color="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <StatCard 
          icon={<Eye />} 
          label="Profile Completion" 
          value={`${completionPercent}%`} 
          color="text-purple-500 bg-purple-500/10 border-purple-500/20"
        />
        <StatCard 
          icon={<Zap />} 
          label="AI Match Score" 
          value="88%" 
          color="text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
        />
        <StatCard 
          icon={<FileText />} 
          label="Saved Jobs" 
          value={15} 
          color="text-green-500 bg-green-500/10 border-green-500/20"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top AI Matches */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="text-primary" size={20} /> Your Top AI Matches
                </h2>
                <p className="text-sm text-muted-foreground">Complete your profile for personalized matches.</p>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recommendedJobs?.map((job) => (
                <div key={job.id} className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase">
                          {job.match ? `${job.match}% Match` : `${Math.floor(Math.random() * (99 - 85 + 1) + 85)}% Match`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building2 size={14} /> {job.companies?.name} 
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <MapPin size={14} /> {job.location}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-bold rounded-lg transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
              {(!recommendedJobs || recommendedJobs.length === 0) && (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground">
                  No matches yet. Complete your profile to get started.
                </div>
              )}
            </div>
          </section>

          {/* Recent Applications */}
          <section>
            <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
            <div className="space-y-3">
              {recentApplications?.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Briefcase size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{app.jobs?.title}</div>
                      <div className="text-xs text-muted-foreground">{app.jobs?.companies?.name}</div>
                    </div>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
              {(!recentApplications || recentApplications.length === 0) && (
                <div className="p-6 text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-border">
                  You haven't applied to any jobs yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Profile Completion */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Profile Strength</h3>
              <span className="text-primary font-bold">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {completionPercent < 100 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Complete these steps to rank higher:</p>
                {!profile?.resume_url && (
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    </div>
                    Upload Resume
                  </Link>
                )}
                {!profile?.headline && (
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    </div>
                    Add Professional Headline
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                <CheckCircle2 size={16} /> All set! You're an All-Star.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary/20 border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/profile" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                Update Resume
              </Link>
              <Link href="/jobs" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                Browse New Jobs
              </Link>
              <Link href="/applications" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                Check Status
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

function Badge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    interviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hired: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border", styles[status as keyof typeof styles] || styles.pending)}>
      {status}
    </span>
  );
}
