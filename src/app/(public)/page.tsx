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

export default function LandingPage() {
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
              <ScrollReveal key={i} delay={i * 100}>
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
                  <div className="text-sm font-medium mb-4 text-muted-foreground">{job.company} • {job.location}</div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{job.salary}</span>
                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter flex items-center gap-1">
                      Apply Now <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
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
                    "Verified company insights"
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
                  {[
                    {
                      author: "Arjun Nair",
                      reputation: "Expert",
                      timestamp: "2h ago",
                      title: "The rise of Rust in Kochi's Fintech",
                      content: "Seeing a massive shift towards Rust for backend services. If you're a Go dev, now is the time to pivot!",
                      likes: 42
                    },
                    {
                      author: "Meera Krishnan",
                      reputation: "Hiring Manager",
                      timestamp: "5h ago",
                      title: "Hiring AI Engineers @ Coderzon",
                      content: "We're looking for engineers passionate about LLMs. Apply through NexHire for priority review.",
                      likes: 89
                    }
                  ].map((post, i) => (
                    <div key={i} className="p-6 rounded-xl border border-border bg-background shadow-lg hover:border-primary/30 transition-all hover-lift">
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
                  ))}
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
