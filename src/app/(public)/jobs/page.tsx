"use client";

import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter, 
  X, 
  ChevronRight, 
  Zap,
  Building2,
  Clock,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static Job Data for Coderzon
const CODERZON_JOBS = [
  { id: "1", title: "AI Engineer", salary: "₹8 LPA", tags: ["Python", "PyTorch", "LLMs"] },
  { id: "2", title: "Full Stack Python Developer", salary: "₹6 LPA", tags: ["Django", "React", "Postgres"] },
  { id: "3", title: "Python Backend Developer", salary: "₹6 LPA", tags: ["FastAPI", "Redis", "Docker"] },
  { id: "4", title: "Data Analyst", salary: "₹5 LPA", tags: ["SQL", "Pandas", "Tableau"] },
  { id: "5", title: "DevOps Engineer", salary: "₹5 LPA", tags: ["AWS", "K8s", "CI/CD"] },
  { id: "6", title: "Machine Learning Engineer", salary: "Not Disclosed", tags: ["Scikit-Learn", "TensorFlow", "MLOps"] },
  { id: "7", title: "Frontend Developer", salary: "Not Disclosed", tags: ["Next.js", "TypeScript", "Tailwind"] },
  { id: "8", title: "Data Engineer", salary: "Not Disclosed", tags: ["Spark", "Airflow", "Kafka"] },
].map(job => ({
  ...job,
  company: "CODERZON",
  location: "Kochi, Kerala",
  type: "Full-time",
  mode: "Onsite",
  level: "Mid Level",
  postedAt: "2 days ago"
}));

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<typeof CODERZON_JOBS[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredJobs = CODERZON_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      <div className="container mx-auto px-4">
        {/* Header & Search */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center md:text-left">Find Your Next Challenge</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by title, skills, or keywords..."
              className="w-full bg-secondary/50 border border-border rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-secondary/30 border border-border rounded-lg text-white font-bold"
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
              
              <div className="space-y-6 bg-secondary/10 p-6 rounded-xl border border-border lg:bg-transparent lg:p-0 lg:border-none">
                <FilterGroup title="Job Type" options={["Full-time", "Part-time", "Contract"]} selected="Full-time" />
                <FilterGroup title="Work Mode" options={["Remote", "Hybrid", "Onsite"]} selected="Onsite" />
                <FilterGroup title="Experience" options={["Entry", "Mid Level", "Senior"]} selected="Mid Level" />
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Remote"
                    className="w-full bg-secondary/30 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    defaultValue="Kochi, Kerala"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Job List */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="text-white font-bold">{filteredJobs.length}</span> jobs
              </div>
            </div>

            {filteredJobs.map((job) => (
              <div 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="group p-6 rounded-xl border border-border bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex gap-6">
                  <div className="hidden sm:flex w-14 h-14 rounded-lg bg-secondary border border-border items-center justify-center shrink-0">
                    <Building2 size={24} className="text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-medium text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Building2 size={14} /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Building2 size={32} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                      {selectedJob.type}
                    </span>
                  </div>
                  <p className="text-lg text-muted-foreground">{selectedJob.company} • {selectedJob.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <DetailStat icon={<DollarSign size={16} />} label="Salary" value={selectedJob.salary} />
                <DetailStat icon={<BarChart3 size={16} />} label="Level" value={selectedJob.level} />
                <DetailStat icon={<Clock size={16} />} label="Posted" value={selectedJob.postedAt} />
                <DetailStat icon={<Briefcase size={16} />} label="Mode" value={selectedJob.mode} />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-3">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Join CODERZON as a {selectedJob.title}. We are looking for a dedicated {selectedJob.level} professional to join our team in Kochi. 
                    You will be responsible for driving innovation and delivering high-quality solutions using {selectedJob.tags.join(", ")}.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-md bg-secondary border border-border text-sm font-medium text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)] uppercase tracking-wider text-sm">
                  Apply for this position
                </button>
                <button className="flex-1 bg-secondary text-white font-bold py-3 rounded-lg border border-border hover:bg-secondary/80 transition-all uppercase tracking-wider text-sm">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, options, selected }: { title: string, options: string[], selected: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-white">{title}</label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center gap-3 group cursor-pointer">
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              option === selected ? "bg-primary border-primary" : "border-border bg-secondary/30 group-hover:border-primary/50"
            )}>
              {option === selected && <ChevronRight size={10} className="text-white" />}
            </div>
            <span className={cn(
              "text-sm transition-colors",
              option === selected ? "text-white font-medium" : "text-muted-foreground group-hover:text-white"
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
    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-white truncate">{value}</div>
    </div>
  );
}
