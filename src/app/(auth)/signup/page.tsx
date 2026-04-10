"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { signup, signInWithGoogle } from "../actions";
import { Bot, Mail, Lock, User, ArrowRight, Briefcase, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const resolvedSearchParams = use(searchParams);

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Create an account</h1>
        <p className="text-muted-foreground">Join the future of recruitment</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl backdrop-blur-sm">
        <form action={signup} className="space-y-6">
          <input type="hidden" name="role" value={role} />
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={cn(
                "relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all hover:-translate-y-1",
                role === "candidate" 
                  ? "bg-primary/10 border-primary text-primary ring-1 ring-primary shadow-lg shadow-primary/10" 
                  : "bg-background border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {role === "candidate" && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className={cn(
                "p-3 rounded-full transition-colors",
                role === "candidate" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <User size={20} />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider block mb-1">Candidate</span>
                <span className="text-[10px] opacity-70">I'm looking for work</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={cn(
                "relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all hover:-translate-y-1",
                role === "recruiter" 
                  ? "bg-primary/10 border-primary text-primary ring-1 ring-primary shadow-lg shadow-primary/10" 
                  : "bg-background border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {role === "recruiter" && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className={cn(
                "p-3 rounded-full transition-colors",
                role === "recruiter" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <Briefcase size={20} />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider block mb-1">Recruiter</span>
                <span className="text-[10px] opacity-70">I'm hiring talent</span>
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                className="peer flex h-12 w-full rounded-lg border border-input bg-background/50 px-3 pt-4 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
              />
              <label 
                className="absolute left-3 top-1 text-[10px] text-muted-foreground transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none"
                htmlFor="full_name"
              >
                Full Name
              </label>
            </div>

            <div className="relative">
              <input
                className="peer flex h-12 w-full rounded-lg border border-input bg-background/50 px-3 pt-4 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <label 
                className="absolute left-3 top-1 text-[10px] text-muted-foreground transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none"
                htmlFor="email"
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                className="peer flex h-12 w-full rounded-lg border border-input bg-background/50 px-3 pt-4 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <label 
                className="absolute left-3 top-1 text-[10px] text-muted-foreground transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none"
                htmlFor="password"
              >
                Password
              </label>
            </div>
          </div>

          {resolvedSearchParams.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
              {resolvedSearchParams.error}
            </div>
          )}

          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:-translate-y-0.5">
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-secondary/50 hover:bg-secondary hover:text-foreground h-11 w-full text-muted-foreground">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
