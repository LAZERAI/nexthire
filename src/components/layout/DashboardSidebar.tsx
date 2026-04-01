"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Users, 
  User, 
  LogOut, 
  Bot,
  Menu,
  X,
  Briefcase,
  Building2,
  PlusCircle,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

type UserProfile = {
  full_name: string | null;
  email: string | undefined;
  avatar_url: string | null;
  role?: string | null;
};

export default function DashboardSidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const candidateLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications", label: "My Applications", icon: FileText },
    { href: "/dashboard/ai-match", label: "AI Match", icon: Sparkles },
    { href: "/community", label: "Community", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const recruiterLinks = [
    { href: "/recruiter", label: "Dashboard", icon: LayoutDashboard },
    { href: "/recruiter/post-job", label: "Post a Job", icon: PlusCircle },
    { href: "/recruiter/my-jobs", label: "My Jobs", icon: Briefcase },
    { href: "/recruiter/candidates", label: "Candidates", icon: Search },
    { href: "/recruiter/company", label: "Company Profile", icon: Building2 },
  ];

  const links = user.role === "recruiter" ? recruiterLinks : candidateLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <Bot size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NexHire</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-primary">
              {user.full_name ? user.full_name[0] : "U"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-foreground truncate">{user.full_name || "User"}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all text-sm font-medium text-muted-foreground"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
