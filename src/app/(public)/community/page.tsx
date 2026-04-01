"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Heart,
  Flame,
  X,
  Lock,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

const CATEGORIES = ["All", "Hiring", "Career Tips", "Industry News"];

type CommunityComment = {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
};

type CommunityPost = {
  id: string;
  author: string;
  role: string;
  reputation: string;
  timestamp: string;
  title: string;
  content: string;
  reactions: { like: number; heart: number; fire: number; discuss: number };
  category: string;
  initials: string;
  color: string;
};

const COMMENT_TEMPLATES: Record<string, Array<Omit<CommunityComment, "id">>> = {
  "AI/ML Engineering": [
    {
      author: "Akhil Menon",
      role: "Platform Engineer",
      timestamp: "18m ago",
      content: "Solid breakdown on the RAG stack. The caching piece is the part most teams miss.",
    },
    {
      author: "Sara Nair",
      role: "Data Scientist",
      timestamp: "41m ago",
      content: "Did you test reranking before FAISS? Curious where the biggest win came from.",
    },
    {
      author: "Vivek R",
      role: "ML Ops Engineer",
      timestamp: "1h ago",
      content: "Incremental indexing is the difference between a prototype and something people actually use.",
    },
  ],
  "Career Tips": [
    {
      author: "Neha Varma",
      role: "Senior Developer",
      timestamp: "22m ago",
      content: "The negotiation framing here feels realistic. Lead with impact, not entitlement.",
    },
    {
      author: "Sandeep Jose",
      role: "Tech Lead",
      timestamp: "49m ago",
      content: "Agree on benchmarking against national roles. Local market rates lag unless people push back.",
    },
    {
      author: "Ananya P",
      role: "Product Analyst",
      timestamp: "2h ago",
      content: "Impact metrics always help. Numbers make a huge difference in interviews.",
    },
  ],
  "Industry News": [
    {
      author: "Meera Krishnan",
      role: "Hiring Manager",
      timestamp: "28m ago",
      content: "We’re seeing the same trend in our hiring pipeline. The Kerala market is getting much stronger.",
    },
    {
      author: "Rohan Das",
      role: "Founder",
      timestamp: "55m ago",
      content: "This matches the momentum we’re seeing around AI and infra roles.",
    },
    {
      author: "Fathima A",
      role: "Community Lead",
      timestamp: "1h ago",
      content: "Good summary. More companies should share local hiring data like this.",
    },
  ],
  Hiring: [
    {
      author: "Priya Lakshmi",
      role: "Recruiter",
      timestamp: "35m ago",
      content: "Worth sharing the interview loop and compensation range to make this more actionable.",
    },
    {
      author: "Nikhil Thomas",
      role: "Full Stack Engineer",
      timestamp: "1h ago",
      content: "This looks promising. Is remote or hybrid on the table?",
    },
    {
      author: "Asha Menon",
      role: "Candidate Experience",
      timestamp: "2h ago",
      content: "Thanks for posting the stack early. That saves everyone time.",
    },
  ],
};

function createCommentThread(postId: string, category: string): CommunityComment[] {
  const templates = COMMENT_TEMPLATES[category] ?? COMMENT_TEMPLATES["Industry News"];
  return templates.map((comment, index) => ({
    ...comment,
    id: `${postId}-${index}`,
  }));
}

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "Nikhil Menon",
    role: "AI/ML Engineer",
    reputation: "Expert",
    timestamp: "2h ago",
    title: "Building RAG apps with LangChain: practical pipeline",
    content: "I built a Retrieval-Augmented Generation (RAG) app using LangChain for document QA and the results are awesome. Key work items: vectorize docs with OpenAI embeddings, use FAISS for fast similarity search, and orchestrate chains for prompt templating and follow-up answer generation. The UX is smoother when you cache embeddings and support incremental indexing. In Kerala-focused corp use cases, combining local datasets with global AI models reduced query latency by 35%.",
    reactions: { like: 53, heart: 24, fire: 9, discuss: 11 },
    category: "AI/ML Engineering",
    initials: "NM",
    color: "bg-blue-500/20 text-blue-500"
  },
  {
    id: "2",
    author: "Riya Varghese",
    role: "Startup Founder",
    reputation: "Industry News",
    timestamp: "5h ago",
    title: "Kerala startup ecosystem is booming: Q1 2026 review",
    content: "The startup ecosystem in Kerala has seen strong momentum this quarter, with fresh funding rounds and accelerator launches. New support programs from KSIDC are driving deep tech incubations in AI, fintech, and healthcare. This is a great signal for local talent — expect more opportunities and competitive salaries. MNCs are also establishing innovation centers here, which makes the local market much more attractive for dev career growth.",
    reactions: { like: 110, heart: 62, fire: 27, discuss: 19 },
    category: "Industry News",
    initials: "RV",
    color: "bg-green-500/20 text-green-500"
  },
  {
    id: "3",
    author: "Neena Thomas",
    role: "Senior HR Consultant",
    reputation: "Career Tips",
    timestamp: "1d ago",
    title: "Salary negotiation tips for Kerala developers",
    content: "Many developers in Kerala underprice themselves due to local market myths. Always benchmark against national and global rates, and highlight your impact metrics (productivity gains, release frequency, ROI). Practice empathetic negotiation: lead with collaboration and then present your target range backed by data. Remember: employers budget for value, not just hours, and a 10% increase is often feasible during hiring.",
    reactions: { like: 142, heart: 72, fire: 33, discuss: 17 },
    category: "Career Tips",
    initials: "NT",
    color: "bg-yellow-500/20 text-yellow-500"
  },
  {
    id: "4",
    author: "Jomon Philip",
    role: "DevOps Specialist",
    reputation: "Industry News",
    timestamp: "1d ago",
    title: "Kubernetes + DevOps best practices for 2026",
    content: "In 2026, the focus is on GitOps, policy as code, and security-first Kubernetes operations. If you're not using tools like ArgoCD, Flux, and OPA, you're missing the standard trend. Container lifecycle automation with proper canary releases and automated rollback is critical. In Kerala, teams are adopting IaC with Terraform + Pulumi alongside managed clusters to reduce ops overhead.",
    reactions: { like: 118, heart: 52, fire: 28, discuss: 14 },
    category: "Industry News",
    initials: "JP",
    color: "bg-cyan-500/20 text-cyan-500"
  },
  {
    id: "5",
    author: "Siddharth Das",
    role: "Full Stack Dev",
    reputation: "Top Contributor",
    timestamp: "2d ago",
    title: "Remote work vs. Kochi office culture",
    content: "After 3 years of fully remote work, I visited a coworking space in SmartCity yesterday. The energy was infectious! While I love the freedom of remote, I realized I missed the whiteboard sessions and casual coffee chats. Hybrid seems to be the sweet spot for Kerala's tech community right now. What's your preference? Are you team Remote, Office, or Hybrid?",
    reactions: { like: 67, heart: 20, fire: 15, discuss: 45 },
    category: "Career Tips",
    initials: "SD",
    color: "bg-yellow-500/20 text-yellow-500"
  },
  {
    id: "6",
    author: "Priya Lakshmi",
    role: "Technical Recruiter",
    reputation: "Recruiter",
    timestamp: "3d ago",
    title: "Top 5 skills for 2026 graduates",
    content: "Beyond just coding, hiring managers are looking for: 1. AI Tooling proficiency (Cursor, Copilot), 2. Systems thinking and architecture basics, 3. Soft skills and communication, 4. Cloud-native architecture (AWS/Azure), 5. Open source contributions. A GitHub profile with real commits beats a polished resume every single time.",
    reactions: { like: 210, heart: 100, fire: 50, discuss: 28 },
    category: "Career Tips",
    initials: "PL",
    color: "bg-pink-500/20 text-pink-500"
  },
  {
    id: "7",
    author: "David John",
    role: "CTO @ TechWave",
    reputation: "Executive",
    timestamp: "4d ago",
    title: "Why we chose Kochi for our new R&D center",
    content: "Many asked why we picked Kochi over Bangalore or Hyderabad. The answer is simple: Talent retention and quality of life. The talent pool here is incredibly loyal and eager to learn. Plus, the infrastructure in Infopark is world-class without the crushing traffic. We're bullish on Kerala's tech future and are investing heavily in local partnerships.",
    reactions: { like: 340, heart: 150, fire: 80, discuss: 60 },
    category: "Industry News",
    initials: "DJ",
    color: "bg-indigo-500/20 text-indigo-500"
  },
  {
    id: "8",
    author: "Fatima Bi",
    role: "DevRel Engineer",
    reputation: "Community Lead",
    timestamp: "5d ago",
    title: "KochiFOSS 2026 was a blast!",
    content: "Just recovered from an amazing weekend at KochiFOSS. Over 500 attendees, 20+ talks, and endless networking. The highlight was definitely the workshop on building decentralized social networks. If you missed it, we'll be uploading the recordings to our YouTube channel next week. Huge shoutout to the volunteers who made it happen!",
    reactions: { like: 120, heart: 60, fire: 40, discuss: 12 },
    category: "Industry News",
    initials: "FB",
    color: "bg-teal-500/20 text-teal-500"
  },
  {
    id: "9",
    author: "Kiran Thomas",
    role: "Freelance Developer",
    reputation: "Pro",
    timestamp: "6d ago",
    title: "Freelancing rates in 2026: A reality check",
    content: "Don't undervalue yourself! I see too many local devs charging 2020 rates. Inflation is real, and your skills are valuable. For a senior React dev, you should be charging at least $40-$60/hr for international clients. Don't compete on price; compete on quality and reliability. Let's lift the whole market up together.",
    reactions: { like: 180, heart: 40, fire: 90, discuss: 55 },
    category: "Career Tips",
    initials: "KT",
    color: "bg-cyan-500/20 text-cyan-500"
  },
  {
    id: "10",
    author: "Software Solutions Inc.",
    role: "Company Page",
    reputation: "Verified Company",
    timestamp: "1w ago",
    title: "Walk-in Drive: Java Developers (2-5 Yrs)",
    content: "We are conducting a walk-in drive this Saturday at our Geo Infopark office. Positions open for Java Spring Boot developers with Microservices experience. Bring your updated resume and a valid ID proof. On-spot offer rollout for selected candidates! Check our careers page for the full JD.",
    reactions: { like: 95, heart: 10, fire: 5, discuss: 40 },
    category: "Hiring",
    initials: "SS",
    color: "bg-red-500/20 text-red-500"
  },
  {
    id: "11",
    author: "Arjun Nair",
    role: "Platform Engineer",
    reputation: "Expert",
    timestamp: "12h ago",
    title: "How we reduced deployment time from 18 minutes to 4",
    content: "The biggest win came from trimming our Docker layers, caching dependencies properly, and moving repeatable checks earlier in the pipeline. We also split preview builds from release builds so developers get feedback faster without blocking the whole team. Small ops changes made a huge difference in our delivery speed.",
    reactions: { like: 74, heart: 29, fire: 16, discuss: 18 },
    category: "Industry News",
    initials: "AN",
    color: "bg-indigo-500/20 text-indigo-500"
  },
  {
    id: "12",
    author: "Maya Pillai",
    role: "Career Coach",
    reputation: "Top Contributor",
    timestamp: "16h ago",
    title: "Interview prep that actually helps candidates land offers",
    content: "A lot of people study random questions and still freeze in interviews. I tell candidates to build a story bank: one product story, one conflict story, one bug story, one collaboration story, and one mistake story. Once those are sharp, the interview feels like a conversation instead of a quiz.",
    reactions: { like: 88, heart: 35, fire: 20, discuss: 24 },
    category: "Career Tips",
    initials: "MP",
    color: "bg-yellow-500/20 text-yellow-500"
  },
  {
    id: "13",
    author: "Coderzon Talent Team",
    role: "Hiring Team",
    reputation: "Verified Company",
    timestamp: "20h ago",
    title: "Now hiring: React + Product-minded frontend engineers",
    content: "We’re opening 3 roles for frontend engineers who care about performance, accessibility, and design polish. The team ships fast, reviews carefully, and values clean communication. Hybrid roles available for candidates based in Kerala.",
    reactions: { like: 59, heart: 18, fire: 7, discuss: 12 },
    category: "Hiring",
    initials: "CT",
    color: "bg-blue-500/20 text-blue-500"
  },
  {
    id: "14",
    author: "Riya Varghese",
    role: "Startup Founder",
    reputation: "Industry News",
    timestamp: "1d ago",
    title: "Why smaller teams are shipping AI features faster in 2026",
    content: "Smaller product teams are using off-the-shelf models, thinner orchestration layers, and simpler UX patterns to ship AI features without drowning in complexity. The companies that win are not necessarily the ones with the biggest models, but the ones with the clearest workflows and the fastest feedback loops.",
    reactions: { like: 102, heart: 41, fire: 23, discuss: 15 },
    category: "Industry News",
    initials: "RV",
    color: "bg-green-500/20 text-green-500"
  }
];

const INITIAL_COMMENT_THREADS: Record<string, CommunityComment[]> = Object.fromEntries(
  SAMPLE_POSTS.map(post => [post.id, createCommentThread(post.id, post.category)])
);

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_POSTS);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentThreads, setCommentThreads] = useState<Record<string, CommunityComment[]>>(INITIAL_COMMENT_THREADS);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Industry News");
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setFormError("Please enter title and content.");
      return;
    }

    if (!loggedInUser) {
      setFormError("Sign in to create posts.");
      return;
    }

    setIsCreatingPost(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("posts").insert({
        author_id: loggedInUser.id,
        content: newPostContent,
        category: newPostCategory,
      });

      if (error) {
        setFormError(error.message);
        setIsCreatingPost(false);
        return;
      }

      const newPost = {
        id: `${Date.now()}`,
        author: loggedInUser.email || "You",
        role: "Community Member",
        reputation: "Contributor",
        timestamp: "Just now",
        title: newPostTitle,
        content: newPostContent,
        reactions: { like: 0, heart: 0, fire: 0, discuss: 0 },
        category: newPostCategory,
        initials: (loggedInUser.email || "U").charAt(0).toUpperCase(),
        color: "bg-primary/20 text-primary",
      };

      setPosts(prev => [newPost, ...prev]);
      setCommentThreads(prev => ({ ...prev, [newPost.id]: [] }));
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("Industry News");
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(err.message || "Unable to create post.");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !loggedInUser || !commentDraft.trim()) {
      return;
    }

    setIsPostingComment(true);

    const nextComment: CommunityComment = {
      id: `${selectedPost.id}-${Date.now()}`,
      author: loggedInUser.user_metadata?.full_name || loggedInUser.email?.split("@")[0] || "You",
      role: "Community Member",
      timestamp: "Just now",
      content: commentDraft.trim(),
    };

    setCommentThreads(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), nextComment],
    }));

    setPosts(prev => prev.map(post => (
      post.id === selectedPost.id
        ? { ...post, reactions: { ...post.reactions, discuss: post.reactions.discuss + 1 } }
        : post
    )));

    setSelectedPost(prev => prev ? { ...prev, reactions: { ...prev.reactions, discuss: prev.reactions.discuss + 1 } } : prev);
    setCommentDraft("");
    setIsPostingComment(false);
  };


  const toggleReaction = (postId: string, type: string) => {
    setUserReactions(prev => {
      const postReactions = prev[postId] || [];
      if (postReactions.includes(type)) {
        return { ...prev, [postId]: postReactions.filter(r => r !== type) };
      }
      return { ...prev, [postId]: [...postReactions, type] };
    });
  };

  useEffect(() => {
    const supabase = createClient();
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setLoggedInUser(data.session?.user ?? null);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedInUser(session?.user ?? null);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => 
    activeCategory === "All" || post.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Community</h1>
            <p className="text-muted-foreground">Share insights and grow with the Kerala tech network.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
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
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <article 
              key={post.id} 
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold text-lg shrink-0",
                    post.color
                  )}>
                    {post.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-foreground hover:underline">{post.author}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <BadgeCheck size={10} className="text-primary" />
                        {post.reputation}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                      {post.role} • {post.timestamp}
                    </div>
                  </div>
                </div>
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold uppercase border border-primary/10 mb-3">
                  {getCategoryIcon(post.category)}
                  {post.category}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p
                  className={cn(
                    "text-muted-foreground leading-relaxed overflow-hidden transition-all duration-500",
                    expandedPostIds.includes(post.id)
                      ? "max-h-screen"
                      : "max-h-[3em]"
                  )}
                >
                  {post.content}
                </p>
                <button
                  type="button"
                  className="text-primary text-sm font-medium mt-1 inline-block hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (expandedPostIds.includes(post.id)) {
                      setExpandedPostIds(prev => prev.filter(id => id !== post.id));
                    } else {
                      setExpandedPostIds(prev => [...prev, post.id]);
                    }
                  }}
                >
                  {expandedPostIds.includes(post.id) ? "Read less" : "Read more"}
                </button>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                  <ReactionButton 
                    icon={<ThumbsUp size={18} />} 
                    count={post.reactions.like} 
                    active={userReactions[post.id]?.includes('like')} 
                    onClick={() => toggleReaction(post.id, 'like')}
                    label="Like"
                  />
                  <ReactionButton 
                    icon={<Heart size={18} />} 
                    count={post.reactions.heart} 
                    active={userReactions[post.id]?.includes('heart')} 
                    onClick={() => toggleReaction(post.id, 'heart')}
                    label="Insightful"
                  />
                  <ReactionButton 
                    icon={<Flame size={18} />} 
                    count={post.reactions.fire} 
                    active={userReactions[post.id]?.includes('fire')} 
                    onClick={() => toggleReaction(post.id, 'fire')}
                    label="Fire"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setCommentDraft("");
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
                  >
                    <MessageSquare size={18} />
                    <span>Comments</span>
                    <span>{post.reactions.discuss}</span>
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-secondary">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet in this category</h3>
            <p className="text-muted-foreground">Be the first to share something with the community!</p>
          </div>
        )}
      </div>

      {/* Full Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
          <div className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-full border border-border flex items-center justify-center font-bold text-xl shrink-0",
                  selectedPost.color
                )}>
                  {selectedPost.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-foreground">{selectedPost.author}</span>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <BadgeCheck size={12} className="text-primary" />
                      {selectedPost.reputation}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedPost.role} • {selectedPost.timestamp}</div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">{selectedPost.title}</h2>
              <div className="text-muted-foreground leading-relaxed text-lg mb-8 whitespace-pre-wrap">
                {selectedPost.content}
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <MessageSquare size={18} /> Discussion ({selectedPost.reactions.discuss})
                  </h3>
                  <span className="text-xs text-muted-foreground">Visible to everyone, replies need an account.</span>
                </div>

                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                  {(commentThreads[selectedPost.id] || []).length > 0 ? (
                    (commentThreads[selectedPost.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border bg-secondary/10 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-foreground text-sm">{comment.author}</div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{comment.role} • {comment.timestamp}</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">Reply</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-secondary/20 rounded-xl p-6 text-center border border-border border-dashed">
                      <p className="text-muted-foreground">No comments yet. Be the first to reply.</p>
                    </div>
                  )}
                </div>

                {loggedInUser ? (
                  <div className="space-y-3">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Write a thoughtful reply..."
                      className="w-full min-h-28 px-4 py-3 border border-border rounded-xl bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">Keep it helpful, specific, and natural.</p>
                      <button
                        type="button"
                        onClick={handleAddComment}
                        disabled={!commentDraft.trim() || isPostingComment}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-60"
                      >
                        <Send size={16} />
                        {isPostingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/20 rounded-xl p-6 text-center border border-border border-dashed">
                    <p className="text-muted-foreground mb-4">Sign in to add your own comment.</p>
                    <Link href="/login" className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all inline-block">
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {!loggedInUser ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to Post</h2>
                <p className="text-muted-foreground mb-6">Join the community first so you can create posts, comment, and react.</p>
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all">
                    Log In
                  </Link>
                  <Link href="/signup" className="w-full py-3 bg-secondary text-foreground font-bold rounded-lg border border-border hover:bg-secondary/80 transition-all">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Create Post</h2>
                {formError && (
                  <div className="mb-4 text-sm text-destructive font-medium">{formError}</div>
                )}
                <input
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write your post content..."
                  className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-foreground h-28 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option>Hiring</option>
                  <option>Career Tips</option>
                  <option>Industry News</option>
                </select>
                <button
                  onClick={handleCreatePost}
                  disabled={isCreatingPost}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                  {isCreatingPost ? "Posting..." : "Post"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReactionButton({ icon, count, active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-all px-2 py-1 rounded hover:bg-secondary",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
      title={label}
    >
      {icon}
      <span>{count + (active ? 1 : 0)}</span>
    </button>
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
