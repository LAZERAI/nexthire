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

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="container px-4 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Bot size={16} />
            <span>Next-Gen Semantic Matching is here</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Hire and get hired <br className="hidden md:block" /> with precision AI.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            NexHire uses advanced vector embeddings to match the right talent with the perfect role. No keywords, just semantic understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/jobs" 
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,112,243,0.4)]"
            >
              <span className="relative z-10">Find Your Next Role</span>
              <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            
            <Link 
              href="/create-company" 
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-secondary/80 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-black/50 backdrop-blur-sm">
        <div className="container px-4 mx-auto py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Jobs", value: "12,450+" },
              { label: "Hired Talent", value: "8,200+" },
              { label: "Companies", value: "450+" },
              { label: "Match Accuracy", value: "98.2%" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI Match Works */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">The AI Matching Pipeline</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              We've replaced outdated keyword filtering with high-dimensional vector space analysis.
            </p>
          </div>
          
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
              <div key={i} className="p-8 rounded-2xl border border-border bg-secondary/30 hover:border-primary/30 transition-all group">
                <div className="mb-4 inline-block p-3 rounded-lg bg-secondary border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-24 bg-secondary/20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Opportunities</h2>
              <p className="text-muted-foreground">Hand-picked roles from top-tier tech companies.</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-2 text-primary font-semibold hover:underline">
              View all jobs <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Senior Frontend Engineer",
                company: "Vercel",
                location: "Remote",
                salary: "$160k - $220k",
                type: "Full-time",
                tags: ["React", "Next.js", "Tailwind"]
              },
              {
                title: "AI Product Designer",
                company: "Linear",
                location: "Hybrid (NYC)",
                salary: "$140k - $190k",
                type: "Full-time",
                tags: ["Figma", "AI/UX", "Product"]
              },
              {
                title: "Backend Specialist (Rust)",
                company: "Supabase",
                location: "Remote",
                salary: "$150k - $210k",
                type: "Contract",
                tags: ["Rust", "Postgres", "Go"]
              }
            ].map((job, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background hover:scale-[1.02] transition-transform cursor-pointer shadow-sm hover:shadow-primary/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center">
                    <Briefcase size={20} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{job.title}</h3>
                <div className="text-sm font-medium mb-4">{job.company} • {job.location}</div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.map((tag, j) => (
                    <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{job.salary}</span>
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter flex items-center gap-1">
                    Apply Now <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Preview */}
      <section className="py-24 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold mb-6 uppercase tracking-widest">
                <Users size={14} />
                <span>Join the Network</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">More than just a job board.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Connect with thousands of developers and recruiters in our professional feed. Share insights, build your network, and stay ahead of the curve.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time professional feed",
                  "Expert-led career advice",
                  "Direct recruiter messaging",
                  "Verified company insights"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-primary/20">
                      <ArrowRight size={14} className="text-primary" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/community" className="text-lg font-bold flex items-center gap-2 text-white hover:text-primary transition-colors">
                Explore Community <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
              <div className="relative border border-border rounded-2xl bg-secondary/50 p-4 aspect-[4/3] shadow-2xl">
                <div className="w-full h-full rounded-xl border border-border bg-background overflow-hidden p-6">
                  {/* Mock Feed Item */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                      <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
                  </div>
                  <div className="mt-8 pt-8 border-t border-border flex gap-6">
                    <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-black">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary mb-6">NexHire</div>
              <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                The modern standard for recruitment. Powered by semantic AI to bridge the gap between talent and innovation.
              </p>
              <div className="flex gap-4 text-muted-foreground">
                <Twitter className="hover:text-primary cursor-pointer" />
                <Github className="hover:text-primary cursor-pointer" />
                <Linkedin className="hover:text-primary cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs Board</Link></li>
                <li><Link href="/ai-match" className="hover:text-white transition-colors">AI Match</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
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
