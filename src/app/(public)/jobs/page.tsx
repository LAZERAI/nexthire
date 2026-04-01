"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter, 
  X, 
  ChevronRight, 
  Building2,
  Clock,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

// Realistic Job Data
const REAL_JOBS = [
  { 
    id: "1", 
    title: "DevOps Engineer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "₹5 LPA - ₹8 LPA", 
    type: "Full-time",
    mode: "Onsite",
    level: "Mid Level",
    postedAt: "2 days ago",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    description: "We are seeking a skilled DevOps Engineer to streamline our deployment pipelines and manage our cloud infrastructure. You will work closely with development teams to ensure high availability and scalability of our applications. Proficiency in AWS services (EC2, S3, RDS) and container orchestration with Kubernetes is essential. Experience with infrastructure as code tools like Terraform is a strong plus."
  },
  { 
    id: "2", 
    title: "Frontend Developer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "Not Disclosed", 
    type: "Full-time",
    mode: "Onsite",
    level: "Mid Level",
    postedAt: "1 day ago",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
    description: "Join our frontend team to build responsive and performant web applications using the latest React ecosystem. You'll be translating Figma designs into pixel-perfect UI components and optimizing application speed. Strong command of TypeScript and modern CSS frameworks like Tailwind is required. Experience with server-side rendering in Next.js is highly desirable."
  },
  { 
    id: "3", 
    title: "Data Engineer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "Not Disclosed", 
    type: "Full-time",
    mode: "Hybrid",
    level: "Senior",
    postedAt: "3 days ago",
    tags: ["Python", "Spark", "Airflow", "SQL", "BigQuery"],
    description: "We are looking for a Senior Data Engineer to design and maintain our data pipelines. You will be responsible for ETL processes, data warehousing, and ensuring data quality across the organization. Expertise in Apache Spark and workflow orchestration tools like Airflow is mandatory. You should be comfortable working with large datasets and optimizing SQL queries."
  },
  { 
    id: "4", 
    title: "Python Backend Developer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "₹6 LPA - ₹10 LPA", 
    type: "Full-time",
    mode: "Onsite",
    level: "Mid Level",
    postedAt: "Just now",
    tags: ["Python", "Django", "FastAPI", "PostgreSQL", "Redis"],
    description: "We need a robust Python Backend Developer to build scalable APIs and microservices. You will be working with Django and FastAPI to deliver high-performance backend solutions. Knowledge of database design, caching strategies with Redis, and asynchronous task queues is expected. You will collaborate with frontend devs to integrate user-facing elements."
  },
  { 
    id: "5", 
    title: "Machine Learning Engineer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "Not Disclosed", 
    type: "Full-time",
    mode: "Remote",
    level: "Senior",
    postedAt: "5 days ago",
    tags: ["TensorFlow", "PyTorch", "Scikit-learn", "MLOps", "NLP"],
    description: "Drive our AI initiatives as a Machine Learning Engineer. You will design, train, and deploy machine learning models for real-world applications. Deep understanding of deep learning frameworks and experience with NLP or computer vision is required. Familiarity with MLOps practices for model monitoring and deployment is a key differentiator."
  },
  { 
    id: "6", 
    title: "Full Stack Python Developer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "₹6 LPA - ₹9 LPA", 
    type: "Full-time",
    mode: "Onsite",
    level: "Mid Level",
    postedAt: "1 week ago",
    tags: ["Python", "React", "Django", "SQL", "Git"],
    description: "We are looking for a versatile Full Stack Developer who is comfortable with both Python backend and React frontend. You will be responsible for end-to-end feature development, from database schema design to UI implementation. Ability to switch contexts between server-side logic and client-side interactivity is crucial. Good communication skills are a must."
  },
  { 
    id: "7", 
    title: "Data Analyst", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "₹5 LPA - ₹7 LPA", 
    type: "Full-time",
    mode: "Hybrid",
    level: "Entry",
    postedAt: "2 days ago",
    tags: ["SQL", "Excel", "Tableau", "PowerBI", "Python"],
    description: "Start your career as a Data Analyst helping us derive insights from business data. You will create dashboards, generate reports, and perform ad-hoc analysis to support decision-making. Strong SQL skills and proficiency in visualization tools like Tableau or PowerBI are required. Basic knowledge of Python for data manipulation is a plus."
  },
  { 
    id: "8", 
    title: "AI Engineer", 
    company: "CODERZON",
    location: "Kochi, Kerala",
    salary: "₹8 LPA - ₹15 LPA", 
    type: "Full-time",
    mode: "Onsite",
    level: "Senior",
    postedAt: "3 days ago",
    tags: ["LLMs", "LangChain", "OpenAI API", "Vector DB", "Python"],
    description: "Join our R&D team as an AI Engineer focusing on Large Language Models. You will build generative AI applications using LangChain and vector databases. Experience with prompt engineering, fine-tuning models, and integrating LLM APIs is essential. You will be at the forefront of implementing cutting-edge AI features into our product suite."
  },
  { 
    id: "9", 
    title: "Product Manager", 
    company: "TechVibe", 
    location: "Trivandrum, Kerala", 
    salary: "₹12 LPA - ₹18 LPA", 
    type: "Full-time", 
    mode: "Hybrid", 
    level: "Senior", 
    postedAt: "4 hours ago", 
    tags: ["Product Strategy", "Agile", "Jira", "User Research"], 
    description: "Lead the product vision for our flagship SaaS platform. You will work with engineering, design, and marketing teams to deliver high-impact features. Strong analytical skills and experience in B2B product management are required." 
  },
  { 
    id: "10", 
    title: "UX/UI Designer", 
    company: "CreativeStudio", 
    location: "Kochi, Kerala", 
    salary: "₹6 LPA - ₹10 LPA", 
    type: "Contract", 
    mode: "Remote", 
    level: "Mid Level", 
    postedAt: "1 day ago", 
    tags: ["Figma", "Prototyping", "User Testing", "Design Systems"], 
    description: "We need a creative UX/UI Designer to craft intuitive and beautiful user interfaces. You will be responsible for user flows, wireframes, and high-fidelity mockups. Proficiency in Figma and a strong portfolio demonstrating user-centric design are mandatory." 
  },
  { 
    id: "11", 
    title: "Go Backend Developer", 
    company: "SystemScale", 
    location: "Kochi, Kerala", 
    salary: "₹10 LPA - ₹16 LPA", 
    type: "Full-time", 
    mode: "Onsite", 
    level: "Senior", 
    postedAt: "5 days ago", 
    tags: ["Go", "gRPC", "Microservices", "PostgreSQL"], 
    description: "Build high-performance microservices in Go. We are dealing with high-throughput systems that require low latency. Deep understanding of concurrency in Go and experience with gRPC is required." 
  },
  { 
    id: "12", 
    title: "Mobile App Developer", 
    company: "Appify", 
    location: "Calicut, Kerala", 
    salary: "₹7 LPA - ₹12 LPA", 
    type: "Full-time", 
    mode: "Hybrid", 
    level: "Mid Level", 
    postedAt: "1 week ago", 
    tags: ["Flutter", "Dart", "iOS", "Android", "Firebase"], 
    description: "Develop cross-platform mobile applications using Flutter. You will be responsible for building smooth UIs and integrating with backend APIs. Experience publishing apps to the App Store and Play Store is expected." 
  },
  { 
    id: "13", 
    title: "Platform Engineer", 
    company: "InfraPilot", 
    location: "Kochi, Kerala", 
    salary: "₹12 LPA - ₹20 LPA", 
    type: "Full-time", 
    mode: "Remote", 
    level: "Senior", 
    postedAt: "8 hours ago", 
    tags: ["Terraform", "Kubernetes", "AWS", "Observability", "CI/CD"], 
    description: "Own the internal platform that powers deployments, observability, and environment consistency. You will work closely with product engineers to reduce friction and improve developer velocity. Experience with IaC, cloud networking, and service reliability is required." 
  },
  { 
    id: "14", 
    title: "QA Automation Engineer", 
    company: "TestRail Labs", 
    location: "Trivandrum, Kerala", 
    salary: "₹6 LPA - ₹11 LPA", 
    type: "Full-time", 
    mode: "Hybrid", 
    level: "Mid Level", 
    postedAt: "Just now", 
    tags: ["Playwright", "Jest", "CI/CD", "Automation", "QA"], 
    description: "Help us build a reliable automation suite for web and API testing. You will design test coverage for high-value user flows, reduce flaky tests, and collaborate with frontend and backend teams on release confidence. Strong browser automation experience is a plus." 
  },
  { 
    id: "15", 
    title: "Security Engineer", 
    company: "FortGuard", 
    location: "Remote", 
    salary: "₹14 LPA - ₹24 LPA", 
    type: "Full-time", 
    mode: "Remote", 
    level: "Senior", 
    postedAt: "2 days ago", 
    tags: ["AppSec", "OWASP", "Threat Modeling", "Cloud Security", "Zero Trust"], 
    description: "Partner with engineering teams to harden products and shipping workflows. This role focuses on threat modeling, secure architecture reviews, and practical remediation. You should be comfortable balancing speed with security controls in a fast-moving product team." 
  },
  { 
    id: "16", 
    title: "DevRel / Community Engineer", 
    company: "StackCircle", 
    location: "Kochi, Kerala", 
    salary: "₹8 LPA - ₹14 LPA", 
    type: "Full-time", 
    mode: "Hybrid", 
    level: "Mid Level", 
    postedAt: "4 days ago", 
    tags: ["Developer Relations", "Content", "Speaking", "Open Source"], 
    description: "Build programs, tutorials, and community content that help developers adopt our platform. You will create sample apps, answer technical questions, and represent the product at events. This role blends product empathy with strong communication skills." 
  },
  { 
    id: "17", 
    title: "Senior Data Scientist", 
    company: "InsightForge", 
    location: "Bengaluru, Karnataka", 
    salary: "₹18 LPA - ₹28 LPA", 
    type: "Full-time", 
    mode: "Hybrid", 
    level: "Senior", 
    postedAt: "6 hours ago", 
    tags: ["Python", "Statistics", "SQL", "A/B Testing", "LLMs"], 
    description: "Turn product and business data into decisions. You will design experiments, build predictive models, and communicate findings clearly to leadership. The ideal candidate can balance rigorous analysis with practical product thinking." 
  },
  { 
    id: "18", 
    title: "Lead Mobile Engineer", 
    company: "Appify", 
    location: "Kochi, Kerala", 
    salary: "₹15 LPA - ₹22 LPA", 
    type: "Full-time", 
    mode: "Onsite", 
    level: "Senior", 
    postedAt: "1 day ago", 
    tags: ["Flutter", "iOS", "Android", "Architecture", "Firebase"], 
    description: "Own the mobile roadmap for a consumer app used at scale. You will guide architecture decisions, mentor engineers, and ship polished experiences across iOS and Android. Experience leading mobile releases and performance tuning is important." 
  }
];

export default function JobsPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<typeof REAL_JOBS[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    checkUser();
    return () => clearTimeout(timer);
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  const handleApply = async () => {
    if (!user) {
      toast("Please sign in to apply for this job", "info");
      router.push(`/login?returnUrl=/jobs`);
      return;
    }

    if (!selectedJob) return;

    setIsApplying(true);
    try {
      const { data: dbJobs } = await supabase.from('jobs').select('id').eq('title', selectedJob.title).limit(1);
      const jobId = dbJobs?.[0]?.id;

      if (!jobId) {
        toast("This is a demo job listing. Real applications require a database job record.", "info");
        return;
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          candidate_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast("You have already applied for this position.", "info");
        } else {
          throw error;
        }
      } else {
        toast("Application submitted successfully!", "success");
        setSelectedJob(null);
      }
    } catch (err: any) {
      toast(err.message || "Failed to submit application", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const filteredJobs = REAL_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-8 pb-20 page-transition">
      <div className="container mx-auto px-4">
        {/* Header & Search */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Find Your Next Challenge
          </h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by title, skills, or company..."
              className="w-full bg-secondary/50 border border-border rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 text-foreground">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-secondary/30 border border-border rounded-lg text-foreground font-bold hover:bg-secondary/50 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Sidebar Filters */}
          <aside className={cn(
            "lg:w-64 space-y-8 lg:block",
            showFilters ? "block" : "hidden"
          )}>
            <div>
              <div className="hidden lg:flex items-center gap-2 font-bold mb-4 uppercase tracking-wider text-xs text-muted-foreground">
                <Filter size={14} /> Filters
              </div>
              
              <div className="space-y-6 bg-card p-6 rounded-xl border border-border lg:bg-transparent lg:p-0 lg:border-none shadow-sm lg:shadow-none">
                <FilterGroup title="Job Type" options={["Full-time", "Part-time", "Contract"]} selected="Full-time" />
                <FilterGroup title="Work Mode" options={["Remote", "Hybrid", "Onsite"]} selected="Onsite" />
                <FilterGroup title="Experience" options={["Entry", "Mid Level", "Senior"]} selected="Mid Level" />
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input 
                      type="text" 
                      placeholder="e.g. Remote"
                      className="w-full bg-secondary/30 border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
                      defaultValue="Kochi, Kerala"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Job List */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-bold">{isLoading ? "..." : filteredJobs.length}</span> of <span className="text-foreground font-bold">{REAL_JOBS.length}</span> jobs
              </div>
            </div>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 rounded-xl border border-border bg-card animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-lg bg-secondary" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-1/3 bg-secondary rounded" />
                      <div className="h-4 w-1/2 bg-secondary rounded" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-5 w-16 bg-secondary rounded-full" />
                        <div className="h-5 w-16 bg-secondary rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden hover-lift"
                >
                  <div className="flex gap-6">
                    <div className="hidden sm:flex w-14 h-14 rounded-lg bg-secondary border border-border items-center justify-center shrink-0">
                      <Building2 size={24} className="text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start text-foreground">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                          {job.title}
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{job.postedAt}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-medium text-muted-foreground mb-4">
                        <span className="flex items-center gap-1 hover:text-foreground transition-colors"><Building2 size={14} /> {job.company}</span>
                        <span className="flex items-center gap-1 hover:text-foreground transition-colors"><MapPin size={14} /> {job.location}</span>
                        <span className="flex items-center gap-1 text-foreground font-semibold"><DollarSign size={14} /> {job.salary}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase tracking-wider group-hover:bg-primary/5 group-hover:text-primary/80 transition-colors">
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 4 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                            +{job.tags.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Job Detail Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] transition-all duration-300",
          selectedJob ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            selectedJob ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSelectedJob(null)}
        />

        {/* Drawer */}
        <div 
          className={cn(
            "absolute top-0 right-0 w-full max-w-2xl h-full bg-background border-l border-border shadow-2xl transform transition-transform duration-300 flex flex-col",
            selectedJob ? "translate-x-0" : "translate-x-full"
          )}
        >
          {selectedJob && (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                    <Building2 size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground leading-tight">{selectedJob.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <DetailStat icon={<DollarSign size={18} />} label="Salary" value={selectedJob.salary} />
                  <DetailStat icon={<BarChart3 size={18} />} label="Level" value={selectedJob.level} />
                  <DetailStat icon={<Briefcase size={18} />} label="Type" value={selectedJob.type} />
                  <DetailStat icon={<MapPin size={18} />} label="Mode" value={selectedJob.mode} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-bold">About the Role</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 font-bold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-md bg-secondary border border-border text-sm font-medium text-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                  <div className="mt-1">
                    <AlertCircle size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm mb-1">Hiring Fast</h4>
                    <p className="text-xs text-muted-foreground">
                      This role was posted {selectedJob.postedAt} and matches your location preference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-border bg-background sticky bottom-0 z-10 flex gap-4">
                <button 
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isApplying ? <Loader2 className="animate-spin" size={18} /> : <>Apply Now <ChevronRight size={18} /></>}
                </button>
                <button className="px-6 py-3.5 bg-secondary text-foreground font-bold rounded-xl border border-border hover:bg-secondary/80 transition-all">
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, options, selected }: { title: string, options: string[], selected: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-foreground">{title}</label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center gap-3 group cursor-pointer select-none">
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              option === selected 
                ? "bg-primary border-primary" 
                : "border-border bg-secondary/30 group-hover:border-primary/50"
            )}>
              {option === selected && <ChevronRight size={10} className="text-primary-foreground" />}
            </div>
            <span className={cn(
              "text-sm transition-colors",
              option === selected ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-foreground truncate">{value}</div>
    </div>
  );
}
