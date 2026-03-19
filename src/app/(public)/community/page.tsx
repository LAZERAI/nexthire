"use client";

import { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreHorizontal,
  BadgeCheck,
  TrendingUp,
  Briefcase,
  Lightbulb,
  Newspaper,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hiring", "Career Tips", "Industry News"];

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "Arjun Nair",
    role: "Senior Architect",
    reputation: "Expert",
    timestamp: "2h ago",
    title: "The rise of Rust in Kochi's Fintech scene",
    content: "Seeing a massive shift towards Rust for backend services in Infopark. Companies are prioritizing performance and safety. If you're a C++ or Go dev, now is the time to pivot!",
    helpfulCount: 42,
    category: "Industry News"
  },
  {
    id: "2",
    author: "Meera Krishnan",
    role: "HR Head @ Coderzon",
    reputation: "Hiring Manager",
    timestamp: "5h ago",
    title: "We're hiring 10+ AI Engineers in Kochi!",
    content: "Coderzon is expanding its AI division. We're looking for passionate engineers who want to work on cutting-edge LLM applications. Apply through the NexHire jobs board for priority review.",
    helpfulCount: 89,
    category: "Hiring"
  },
  {
    id: "3",
    author: "Rahul Varma",
    role: "Lead Developer",
    reputation: "Mentor",
    timestamp: "1d ago",
    title: "How to ace your Next.js 15 interviews",
    content: "With the release of Next.js 15, interviewers are looking for deep understanding of Server Actions and the new caching semantics. Don't just follow tutorials—understand the 'why'.",
    helpfulCount: 156,
    category: "Career Tips"
  },
  {
    id: "4",
    author: "Anjali Menon",
    role: "Product Designer",
    reputation: "Rising Star",
    timestamp: "1d ago",
    title: "Digital transformation in Kerala government sectors",
    content: "Exciting projects coming up in the public sector. The focus on UI/UX is finally getting the attention it deserves. Great opportunities for local designers to make a real impact.",
    helpfulCount: 34,
    category: "Industry News"
  },
  {
    id: "5",
    author: "Siddharth Das",
    role: "Full Stack Dev",
    reputation: "Top Contributor",
    timestamp: "2d ago",
    title: "Remote work vs. Kochi office culture",
    content: "After 3 years of remote, I visited an office in SmartCity yesterday. The energy was infectious. Hybrid seems to be the sweet spot for Kerala's tech community. What do you think?",
    helpfulCount: 67,
    category: "Career Tips"
  },
  {
    id: "6",
    author: "Priya Lakshmi",
    role: "Technical Recruiter",
    reputation: "Recruiter",
    timestamp: "3d ago",
    title: "Top 5 skills for 2026 graduates",
    content: "Beyond coding, focus on: 1. AI Tooling proficiency, 2. Systems thinking, 3. Soft skills, 4. Cloud-native architecture, 5. Open source contributions.",
    helpfulCount: 210,
    category: "Career Tips"
  }
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [helpfulPosts, setHelpfulPosts] = useState<string[]>([]);

  const toggleHelpful = (id: string) => {
    setHelpfulPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredPosts = SAMPLE_POSTS.filter(post => 
    activeCategory === "All" || post.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Community</h1>
            <p className="text-muted-foreground">Share insights and grow with the Kerala tech network.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)]">
            <Plus size={20} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border shrink-0",
                activeCategory === cat 
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,112,243,0.1)]" 
                  : "bg-secondary/30 border-border text-muted-foreground hover:border-muted hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <article key={post.id} className="p-6 rounded-2xl border border-border bg-secondary/10 hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary border border-border flex items-center justify-center font-bold text-primary shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">{post.author}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                        <BadgeCheck size={10} className="text-primary" />
                        {post.reputation}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                      {post.role} • {post.timestamp}
                    </div>
                  </div>
                </div>
                <button className="p-2 text-muted-foreground hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold uppercase border border-primary/10 mb-3">
                  {getCategoryIcon(post.category)}
                  {post.category}
                </div>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleHelpful(post.id)}
                    className={cn(
                      "flex items-center gap-2 text-sm font-bold transition-all px-3 py-1.5 rounded-md",
                      helpfulPosts.includes(post.id)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-white hover:bg-secondary"
                    )}
                  >
                    <ThumbsUp size={18} fill={helpfulPosts.includes(post.id) ? "currentColor" : "none"} />
                    <span>{post.helpfulCount + (helpfulPosts.includes(post.id) ? 1 : 0)}</span>
                    <span className="hidden sm:inline">Helpful</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-secondary">
                    <MessageSquare size={18} />
                    <span className="hidden sm:inline">Discuss</span>
                  </button>
                </div>

                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-white mb-2">No posts yet in this category</h3>
            <p className="text-muted-foreground">Be the first to share something with the community!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Hiring": return <Briefcase size={10} />;
    case "Career Tips": return <Lightbulb size={10} />;
    case "Industry News": return <TrendingUp size={10} />;
    default: return <Newspaper size={10} />;
  }
}
