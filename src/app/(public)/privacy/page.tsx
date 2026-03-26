import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar / TOC */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                  <ArrowLeft size={16} /> Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: March 23, 2026</p>
              </div>
              
              <nav className="hidden lg:block space-y-1 border-l border-border pl-4">
                <a href="#collection" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Data Collection</a>
                <a href="#usage" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">How We Use Data</a>
                <a href="#third-party" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Third Party Services</a>
                <a href="#rights" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Your Rights</a>
                <a href="#contact" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Contact Us</a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12 max-w-3xl">
            <section id="collection" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <DatabaseIcon />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Data Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us when you create an account, upload a resume, or interact with our AI services. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and location.</li>
                <li><strong>Professional Data:</strong> Resumes (PDF/DOCX), work history, skills, and education.</li>
                <li><strong>Usage Data:</strong> Interaction with job postings, search queries, and application history.</li>
              </ul>
            </section>

            <section id="usage" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Data</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your data powers the core functionality of NexHire, specifically our semantic matching engine. We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Generate vector embeddings of your resume for job matching.</li>
                <li>Recommend relevant job opportunities based on skill adjacency.</li>
                <li>Allow recruiters to find your profile when it matches their requirements.</li>
                <li>Improve our AI models (anonymized and aggregated data only).</li>
              </ul>
            </section>

            <section id="third-party" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Server size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Third Party Services</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We trust industry leaders to handle specific parts of our infrastructure. We do not sell your data to these providers.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ServiceCard 
                  name="Supabase" 
                  role="Database & Auth" 
                  desc="Stores encrypted user data and manages authentication sessions securely."
                />
                <ServiceCard 
                  name="Groq" 
                  role="AI Inference" 
                  desc="Processes resume text for structured data extraction with ephemeral retention."
                />
                <ServiceCard 
                  name="Hugging Face" 
                  role="Embeddings" 
                  desc="Generates vector representations of text for our search engine."
                />
              </div>
            </section>

            <section id="rights" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Your Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You maintain full ownership of your data. At any time, you can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
                <li><strong>Rectify:</strong> Update or correct your profile information via the Dashboard.</li>
                <li><strong>Delete:</strong> Permanently delete your account and all associated data from our servers.</li>
                <li><strong>Opt-out:</strong> Disable AI processing for your profile (this will limit functionality).</li>
              </ul>
            </section>

            <section id="contact" className="p-6 rounded-xl bg-secondary/20 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">Have questions?</h2>
              <p className="text-muted-foreground mb-4">
                Our Data Protection Officer is available to address any concerns regarding your privacy.
              </p>
              <a href="mailto:privacy@nexhire.com" className="text-primary font-bold hover:underline">
                privacy@nexhire.com
              </a>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ name, role, desc }: { name: string, role: string, desc: string }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <div className="font-bold text-foreground mb-1">{name}</div>
      <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{role}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  )
}
