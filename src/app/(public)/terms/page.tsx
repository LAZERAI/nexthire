import Link from "next/link";
import { ArrowLeft, FileText, UserCheck, AlertTriangle, ShieldCheck, Scale } from "lucide-react";

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
                <p className="text-sm text-muted-foreground">Last updated: March 23, 2026</p>
              </div>
              
              <nav className="hidden lg:block space-y-1 border-l border-border pl-4">
                <a href="#acceptance" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Acceptance of Terms</a>
                <a href="#usage" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Use of Service</a>
                <a href="#accounts" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">User Accounts</a>
                <a href="#prohibited" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Prohibited Activities</a>
                <a href="#ai-disclaimer" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">AI Disclaimer</a>
                <a href="#governing" className="block text-sm py-1 text-muted-foreground hover:text-foreground hover:border-l-2 hover:border-primary -ml-[17px] pl-[15px] transition-all">Governing Law</a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12 max-w-3xl">
            <section id="acceptance" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using NexHire, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services.
              </p>
            </section>

            <section id="usage" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Use of Service</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                NexHire provides a platform for job seekers to connect with employers using AI-powered matching. You agree to use the service only for lawful purposes and in accordance with these Terms.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You must be at least 18 years old to use this service.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree not to scrape, copy, or misuse any data from the platform.</li>
              </ul>
            </section>

            <section id="accounts" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We offer two types of accounts: <strong>Candidate</strong> and <strong>Recruiter</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                  <h3 className="font-bold text-foreground mb-2">Candidates</h3>
                  <p className="text-sm text-muted-foreground">Must provide accurate resume and skill data. Falsifying credentials may result in account termination.</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                  <h3 className="font-bold text-foreground mb-2">Recruiters</h3>
                  <p className="text-sm text-muted-foreground">Must represent legitimate companies. Posting fake jobs or spamming candidates is strictly prohibited.</p>
                </div>
              </div>
            </section>

            <section id="prohibited" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Prohibited Activities</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Reverse engineer the AI matching algorithms.</li>
                <li>Upload malicious code or viruses.</li>
                <li>Harass, abuse, or harm another person.</li>
                <li>Impersonate any person or entity.</li>
              </ul>
            </section>

            <section id="ai-disclaimer" className="p-6 rounded-xl bg-primary/5 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground mb-2">5. AI Features Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                Our AI matching engine uses probabilistic models (LLMs and Vector Search) to suggest matches. While we strive for accuracy, <strong>we do not guarantee</strong> that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                <li>Every match will result in an interview or hire.</li>
                <li>The AI analysis of your resume is 100% error-free.</li>
                <li>The "Match Score" is a definitive measure of your qualification.</li>
              </ul>
            </section>

            <section id="governing" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Scale size={20} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Governing Law</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and defined following the laws of <strong>India</strong>. NexHire Inc. and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
