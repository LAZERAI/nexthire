"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Bot size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">NexHire</span>
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
          <Link 
            href="/login" 
            className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="hidden sm:inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,112,243,0.3)]"
          >
            Get Started
          </Link>
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
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
          </div>
        </div>
      )}
    </header>
  );
}
