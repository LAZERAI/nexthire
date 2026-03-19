import Link from "next/link";
import { Bot, Menu, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Bot size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">NexHire</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Jobs
          </Link>
          <Link href="/community" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Community
          </Link>
          <Link href="/ai-match" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            AI Match
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,112,243,0.3)]"
          >
            Get Started
          </Link>
          <button className="md:hidden p-2 text-muted-foreground">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
