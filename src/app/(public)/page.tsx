import Link from "next/link";
import { 
  ArrowRight, 
  Bot, 
  Briefcase, 
  Users, 
  Zap, 
  Search, 
  CheckCircle2, 
  Globe, 
  ShieldCheck,
  Twitter,
  Github,
  Linkedin
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createClient as createSupabaseClient } from "@/lib/supabase-server";

type LandingJobCompany = {
  name: string | null;
  logo_url: string | null;
  website: string | null;
};

type LandingJobRow = {
  title: string;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  skills_required: string[] | null;
  companies: LandingJobCompany | LandingJobCompany[] | null;
};

type LandingPostAuthor = {
  full_name: string | null;
  headline: string | null;
  current_role: string | null;
  role: string | null;
};

type LandingPostRow = {
  title: string | null;
  content: string;
  helpful_count: number | null;
  created_at: string;
  author: LandingPostAuthor | LandingPostAuthor[] | null;
};

type FeaturedJob = {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
};

type CommunityPreviewPost = {
  author: string;
  reputation: string;
  timestamp: string;
  title: string;
  content: string;
  likes: number;
};

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
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

function getReputation(helpfulCount: number, author: LandingPostAuthor | null) {
  const role = `${author?.role || ""} ${author?.current_role || ""}`.toLowerCase();
  if (role.includes("recruit")) {
    return "Recruiter";
  }
  if (role.includes("found")) {
    return "Founder";
  }
  if (helpfulCount >= 120) {
    return "Top Contributor";
  }
  if (helpfulCount >= 80) {
    return "Expert";
  }

  return "Contributor";
}

function buildFeaturedJob(row: LandingJobRow): FeaturedJob {
  const company = normalizeRelation(row.companies);

  return {
    title: row.title,
    company: company?.name || "Independent",
    location: row.location || "Remote",
    salary: row.salary_range || "Not disclosed",
    type: prettifyLabel(row.job_type),
    tags: (row.skills_required || []).slice(0, 3),
  };
}

function buildCommunityPreview(row: LandingPostRow): CommunityPreviewPost {
  const author = normalizeRelation(row.author);
  const helpfulCount = row.helpful_count || 0;

  return {
    author: author?.full_name || "Community member",
    reputation: getReputation(helpfulCount, author),
    timestamp: formatRelativeTime(row.created_at),
    title: row.title || "Community update",
    content: row.content,
    likes: helpfulCount,
  };
}

export default async function LandingPage() {
  const supabase = await createSupabaseClient();
  const [{ data: jobsData }, { data: postsData }] = await Promise.all([
    supabase
      .from("jobs")
      .select("title, location, salary_range, job_type, skills_required, companies(name, logo_url, website)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("posts")
      .select("title, content, helpful_count, created_at, author:profiles(full_name, headline, current_role, role)")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const featuredJobs = ((jobsData ?? []) as LandingJobRow[]).map(buildFeaturedJob);
  const communityPosts = ((postsData ?? []) as LandingPostRow[]).map(buildCommunityPreview);

  return (
    <div className="flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
        
        <div className="container px-4 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <Bot size={16} />
            <span>Next-Gen Semantic Matching is here</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground animate-fade-in-up delay-100">
            Hire and get hired <br className="hidden md:block" /> with precision AI.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            NexHire uses advanced vector embeddings to match the right talent with the perfect role. No keywords, just semantic understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link 
              href="/jobs" 
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,112,243,0.4)]"
            >
              <span className="relative z-10">Find Your Next Role</span>
              <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            
            <Link 
              href="/signup?role=recruiter" 
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-secondary/80 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-background/50 backdrop-blur-sm">
        <ScrollReveal>
          <div className="container px-4 mx-auto py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Active Jobs", value: "1,240+" },
                { label: "Hired Talent", value: "680+" },
                { label: "Companies", value: "85+" },
                { label: "Match Accuracy", value: "94.2%" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How AI Match Works */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">The AI Matching Pipeline</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We've replaced outdated keyword filtering with high-dimensional vector space analysis.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="text-primary" />,
                title: "1. Vectorization",
                desc: "We transform resumes and job descriptions into complex mathematical vectors using Llama 3 models."
              },
              {
                icon: <Zap className="text-primary" />,
                title: "2. Semantic Search",
                desc: "Our pgvector engine calculates the cosine distance between your skills and job requirements in real-time."
              },
              {
                icon: <CheckCircle2 className="text-primary" />,
                title: "3. Perfect Match",
                desc: "You receive a curated list of jobs ranked by true relevance, not just title matching."
              }
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="p-8 rounded-2xl border border-border bg-secondary/30 hover:border-primary/30 transition-all group h-full hover-lift">
                  <div className="mb-4 inline-block p-3 rounded-lg bg-secondary border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-24 bg-secondary/20">
        <div className="container px-4 mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-foreground">Featured Opportunities</h2>
                <p className="text-muted-foreground">Hand-picked roles from top-tier tech companies.</p>
              </div>
              <Link href="/jobs" className="flex items-center gap-2 text-primary font-semibold hover:underline">
                View all jobs <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job, i) => (
                <ScrollReveal key={`${job.title}-${i}`} delay={i * 100}>
                  <div className="p-6 rounded-xl border border-border bg-background hover:scale-[1.02] transition-transform cursor-pointer shadow-sm hover:shadow-primary/5 hover-lift">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center">
                        <Briefcase size={20} className="text-muted-foreground" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        {job.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-foreground">{job.title}</h3>
                    <div className="text-sm font-medium mb-4 text-muted-foreground">
                      {job.company} • {job.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{job.salary}</span>
                      <Link href="/jobs" className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter flex items-center gap-1">
                        View Jobs <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
                No live jobs yet. Recruiters can seed the board after publishing roles.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Community Preview */}
      <section className="py-24 overflow-hidden bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold mb-6 uppercase tracking-widest">
                  <Users size={14} />
                  <span>Join the Network</span>
                </div>
                <h2 className="text-4xl font-bold mb-6 text-foreground">More than just a job board.</h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Connect with thousands of developers and recruiters in our professional feed. Share insights, build your network, and stay ahead of the curve.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Real-time professional feed",
                    "Expert-led career advice",
                    "Direct recruiter messaging",
                    "Verified company insights",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-primary/20">
                        <ArrowRight size={14} className="text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/community" className="text-lg font-bold flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  Explore Community <ArrowRight size={20} />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse-glow" />
                <div className="relative space-y-4">
                  {communityPosts.length > 0 ? (
                    communityPosts.map((post, i) => (
                      <div key={`${post.title}-${i}`} className="p-6 rounded-xl border border-border bg-background shadow-lg hover:border-primary/30 transition-all hover-lift">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-primary border border-border">
                              {post.author[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{post.author}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                                  {post.reputation}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {post.timestamp}
                              </div>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-bold text-foreground mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <div className="flex items-center gap-1 text-primary">
                            <Users size={14} /> {post.likes} found helpful
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-border bg-background text-center text-muted-foreground">
                      No live community posts yet. Seed the community to show activity here.
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-slate-100 dark:bg-black">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary mb-6">NexHire</div>
              <p className="text-slate-600 dark:text-muted-foreground max-w-sm mb-8 leading-relaxed">
                The modern standard for recruitment. Powered by semantic AI to bridge the gap between talent and innovation.
              </p>
              <div className="flex gap-4 text-slate-700 dark:text-muted-foreground">
                <Twitter className="hover:text-primary cursor-pointer" />
                <Github className="hover:text-primary cursor-pointer" />
                <Linkedin className="hover:text-primary cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="text-foreground dark:text-muted-foreground font-bold mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="/jobs" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Jobs Board</Link></li>
                <li><Link href="/ai-match" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">AI Match</Link></li>
                <li><Link href="/community" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground dark:text-muted-foreground font-bold mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="/privacy" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NexHire Inc. Built with precision.
          </div>
        </div>
      </footer>
    </div>
  );
}
