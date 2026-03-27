"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase-client";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Bot size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">NexHire</span>
        </Link>

        {/* Desktop Nav */}
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
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  setUser(null);
                  router.push('/login');
                }}
                className="hidden sm:inline-flex px-4 py-2 bg-destructive text-white text-sm font-bold rounded-md hover:bg-destructive/90 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.35)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <Link 
            href="/jobs" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Jobs
          </Link>
          <Link 
            href="/community" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Community
          </Link>
          <Link 
            href="/ai-match" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            AI Match
          </Link>
          <div className="h-px bg-border my-2" />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  setUser(null);
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="text-left text-sm font-bold text-destructive hover:text-destructive/80 transition-colors py-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
