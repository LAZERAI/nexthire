"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Flame,
  Heart,
  Lightbulb,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Newspaper,
  Plus,
  Send,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";

const CATEGORIES = ["All", "Hiring", "Career Tips", "Industry News"] as const;

type CommunityAuthor = {
  full_name: string | null;
  headline: string | null;
  current_role: string | null;
  role: string | null;
  avatar_url: string | null;
  location: string | null;
};

type DbPostRow = {
  id: string;
  title: string | null;
  content: string;
  category: string | null;
  helpful_count: number | null;
  created_at: string;
  author: CommunityAuthor | CommunityAuthor[] | null;
};

type DbCommentRow = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: CommunityAuthor | CommunityAuthor[] | null;
};

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

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;
};

function normalizeAuthor(author: CommunityAuthor | CommunityAuthor[] | null | undefined): CommunityAuthor | null {
  if (!author) {
    return null;
  }

  return Array.isArray(author) ? author[0] ?? null : author;
}

function getUserDisplayName(user: SessionUser | null) {
  if (!user) {
    return "You";
  }

  return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "You";
}

function getUserRole(user: SessionUser | null) {
  if (!user) {
    return "Community Member";
  }

  const roleLabel = user.user_metadata?.role;
  if (!roleLabel) {
    return "Community Member";
  }

  const normalizedRole = roleLabel.toLowerCase();
  if (normalizedRole.includes("recruit")) {
    return "Recruiter";
  }
  if (normalizedRole.includes("found")) {
    return "Founder";
  }
  if (normalizedRole.includes("candidate")) {
    return "Candidate";
  }

  return roleLabel;
}

function getDisplayRole(author: CommunityAuthor | null) {
  if (!author) {
    return "Community Member";
  }

  return author.current_role || author.headline || (author.role ? author.role.replace(/_/g, " ") : "Community Member");
}

function getReputation(helpfulCount: number, author: CommunityAuthor | null) {
  const role = `${author?.role || ""} ${author?.current_role || ""}`.toLowerCase();
  if (role.includes("recruit")) {
    return "Recruiter";
  }
  if (role.includes("found")) {
    return "Founder";
  }
  if (helpfulCount >= 120) {
    return "Top Contributor";
  }
  if (helpfulCount >= 80) {
    return "Expert";
  }
  if (helpfulCount >= 40) {
    return "Contributor";
  }

  return "Community Member";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatRelativeTime(dateString: string) {
  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) {
    return "Just now";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
  if (elapsedSeconds < 60) {
    return `${Math.max(1, elapsedSeconds)}s ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`;
  }

  return `${Math.floor(elapsedDays / 7)}w ago`;
}

function deriveTitle(title: string | null, content: string) {
  if (title?.trim()) {
    return title.trim();
  }

  const sentence = content.split(/[.!?]/).map((part) => part.trim()).find(Boolean);
  if (sentence) {
    return sentence.length > 72 ? `${sentence.slice(0, 69)}...` : sentence;
  }

  return "Community update";
}

function getCategoryStyle(category: string) {
  switch (category) {
    case "Hiring":
      return "bg-red-500/20 text-red-500";
    case "Career Tips":
      return "bg-yellow-500/20 text-yellow-500";
    case "Industry News":
      return "bg-indigo-500/20 text-indigo-500";
    default:
      return "bg-primary/20 text-primary";
  }
}

function buildComment(row: DbCommentRow): CommunityComment {
  const author = normalizeAuthor(row.author);
  const authorName = author?.full_name || "Community member";

  return {
    id: row.id,
    author: authorName,
    role: getDisplayRole(author),
    timestamp: formatRelativeTime(row.created_at),
    content: row.content,
  };
}

function buildPost(row: DbPostRow, commentCount: number): CommunityPost {
  const author = normalizeAuthor(row.author);
  const authorName = author?.full_name || "Community member";
  const helpfulCount = row.helpful_count || 0;

  return {
    id: row.id,
    author: authorName,
    role: getDisplayRole(author),
    reputation: getReputation(helpfulCount, author),
    timestamp: formatRelativeTime(row.created_at),
    title: deriveTitle(row.title, row.content),
    content: row.content,
    reactions: {
      like: helpfulCount,
      heart: helpfulCount > 0 ? Math.max(1, Math.round(helpfulCount * 0.38)) : 0,
      fire: helpfulCount > 0 ? Math.max(1, Math.round(helpfulCount * 0.16)) : 0,
      discuss: commentCount,
    },
    category: row.category || "Industry News",
    initials: getInitials(authorName),
    color: getCategoryStyle(row.category || "Industry News"),
  };
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Hiring":
      return <Briefcase size={10} />;
    case "Career Tips":
      return <Lightbulb size={10} />;
    case "Industry News":
      return <TrendingUp size={10} />;
    default:
      return <Newspaper size={10} />;
  }
}

function ReactionButton({
  icon,
  count,
  active,
  onClick,
  label,
}: {
  icon: ReactNode;
  count: number;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
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

async function fetchCommunityFeed() {
  const supabase = createClient();

  const [postsResult, commentsResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, content, category, helpful_count, created_at, author:profiles(full_name, headline, current_role, role, avatar_url, location)")
      .order("created_at", { ascending: false }),
    supabase
      .from("post_comments")
      .select("id, post_id, content, created_at, author:profiles(full_name, headline, current_role, role, avatar_url, location)")
      .order("created_at", { ascending: true }),
  ]);

  if (postsResult.error) {
    throw postsResult.error;
  }

  if (commentsResult.error) {
    throw commentsResult.error;
  }

  const commentThreads: Record<string, CommunityComment[]> = {};
  for (const row of (commentsResult.data ?? []) as DbCommentRow[]) {
    if (!commentThreads[row.post_id]) {
      commentThreads[row.post_id] = [];
    }

    commentThreads[row.post_id].push(buildComment(row));
  }

  const posts = ((postsResult.data ?? []) as DbPostRow[]).map((row) => {
    const comments = commentThreads[row.id] || [];
    return buildPost(row, comments.length);
  });

  return { posts, commentThreads };
}

export default function CommunityFeed() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<SessionUser | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentThreads, setCommentThreads] = useState<Record<string, CommunityComment[]>>({});
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<(typeof CATEGORIES)[number]>("Industry News");
  const [formError, setFormError] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      setLoggedInUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email,
              user_metadata: {
                full_name: sessionUser.user_metadata?.full_name ?? null,
                name: sessionUser.user_metadata?.name ?? null,
                role: sessionUser.user_metadata?.role ?? null,
              },
            }
          : null
      );
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      const sessionUser = session?.user;
      setLoggedInUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email,
              user_metadata: {
                full_name: sessionUser.user_metadata?.full_name ?? null,
                name: sessionUser.user_metadata?.name ?? null,
                role: sessionUser.user_metadata?.role ?? null,
              },
            }
          : null
      );
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      setIsLoadingFeed(true);
      setFeedError(null);

      try {
        const { posts: loadedPosts, commentThreads: loadedThreads } = await fetchCommunityFeed();

        if (!isMounted) {
          return;
        }

        setPosts(loadedPosts);
        setCommentThreads(loadedThreads);
        setSelectedPost((current) => {
          if (current) {
            return loadedPosts.find((post) => post.id === current.id) ?? loadedPosts[0] ?? null;
          }

          return loadedPosts[0] ?? null;
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load community feed.";
        setFeedError(message);
      } finally {
        if (isMounted) {
          setIsLoadingFeed(false);
        }
      }
    };

    void loadFeed();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredPosts = posts.filter((post) => activeCategory === "All" || post.category === activeCategory);

  const handleHelpfulClick = (postId: string) => {
    setUserReactions((previous) => {
      const postReactions = previous[postId] || [];
      if (postReactions.includes("like")) {
        return previous;
      }

      return { ...previous, [postId]: [...postReactions, "like"] };
    });
  };

  const handleReactionToggle = (postId: string, type: string) => {
    setUserReactions((previous) => {
      const postReactions = previous[postId] || [];
      if (postReactions.includes(type)) {
        return { ...previous, [postId]: postReactions.filter((reaction) => reaction !== type) };
      }

      return { ...previous, [postId]: [...postReactions, type] };
    });
  };

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
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: loggedInUser.id,
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          category: newPostCategory,
          helpful_count: 0,
        })
        .select("id, created_at")
        .single();

      if (error || !data) {
        setFormError(error?.message || "Unable to create post.");
        return;
      }

      const authorName = getUserDisplayName(loggedInUser);
      const nextPost: CommunityPost = {
        id: data.id,
        author: authorName,
        role: getUserRole(loggedInUser),
        reputation: "Contributor",
        timestamp: "Just now",
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        reactions: { like: 0, heart: 0, fire: 0, discuss: 0 },
        category: newPostCategory,
        initials: getInitials(authorName),
        color: getCategoryStyle(newPostCategory),
      };

      setPosts((previous) => [nextPost, ...previous]);
      setCommentThreads((previous) => ({ ...previous, [nextPost.id]: [] }));
      setSelectedPost(nextPost);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("Industry News");
      setShowCreateModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create post.";
      setFormError(message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !loggedInUser || !commentDraft.trim()) {
      return;
    }

    setIsPostingComment(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: selectedPost.id,
          author_id: loggedInUser.id,
          content: commentDraft.trim(),
        })
        .select("id, created_at")
        .single();

      if (error || !data) {
        setFormError(error?.message || "Unable to post comment.");
        return;
      }

      const authorName = getUserDisplayName(loggedInUser);
      const nextComment: CommunityComment = {
        id: data.id,
        author: authorName,
        role: getUserRole(loggedInUser),
        timestamp: "Just now",
        content: commentDraft.trim(),
      };

      setCommentThreads((previous) => ({
        ...previous,
        [selectedPost.id]: [...(previous[selectedPost.id] || []), nextComment],
      }));

      setPosts((previous) =>
        previous.map((post) =>
          post.id === selectedPost.id
            ? { ...post, reactions: { ...post.reactions, discuss: post.reactions.discuss + 1 } }
            : post
        )
      );

      setSelectedPost((previous) =>
        previous
          ? { ...previous, reactions: { ...previous.reactions, discuss: previous.reactions.discuss + 1 } }
          : previous
      );
      setCommentDraft("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to post comment.";
      setFormError(message);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Community</h1>
            <p className="text-muted-foreground">Live posts and replies from the NexHire network.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Plus size={20} />
            <span>Create Post</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border shrink-0",
                activeCategory === category
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {feedError && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between gap-4">
            <span>{feedError}</span>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        )}

        {isLoadingFeed && posts.length === 0 ? (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-secondary" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-secondary" />
                    <div className="h-3 w-28 rounded bg-secondary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded bg-secondary" />
                  <div className="h-4 w-full rounded bg-secondary" />
                  <div className="h-4 w-11/12 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className={cn("w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold text-lg shrink-0", post.color)}>
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
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold uppercase border border-primary/10 mb-3">
                    {getCategoryIcon(post.category)}
                    {post.category}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p
                    className={cn(
                      "text-muted-foreground leading-relaxed overflow-hidden transition-all duration-500",
                      expandedPostIds.includes(post.id) ? "max-h-screen" : "max-h-[3em]"
                    )}
                  >
                    {post.content}
                  </p>
                  <button
                    type="button"
                    className="text-primary text-sm font-medium mt-1 inline-block hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();

                      setExpandedPostIds((previous) =>
                        previous.includes(post.id) ? previous.filter((id) => id !== post.id) : [...previous, post.id]
                      );
                    }}
                  >
                    {expandedPostIds.includes(post.id) ? "Read less" : "Read more"}
                  </button>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center gap-4">
                    <ReactionButton
                      icon={<ThumbsUp size={18} />}
                      count={post.reactions.like}
                      active={userReactions[post.id]?.includes("like")}
                      onClick={() => handleHelpfulClick(post.id)}
                      label="Helpful"
                    />
                    <ReactionButton
                      icon={<Heart size={18} />}
                      count={post.reactions.heart}
                      active={userReactions[post.id]?.includes("heart")}
                      onClick={() => handleReactionToggle(post.id, "heart")}
                      label="Insightful"
                    />
                    <ReactionButton
                      icon={<Flame size={18} />}
                      count={post.reactions.fire}
                      active={userReactions[post.id]?.includes("fire")}
                      onClick={() => handleReactionToggle(post.id, "fire")}
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
                    <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-secondary">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoadingFeed && filteredPosts.length === 0 && !feedError && (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet in this category</h3>
            <p className="text-muted-foreground">Be the first to share something with the community.</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
          <div className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-14 h-14 rounded-full border border-border flex items-center justify-center font-bold text-xl shrink-0", selectedPost.color)}>
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
                  <div className="text-sm text-muted-foreground">
                    {selectedPost.role} • {selectedPost.timestamp}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold uppercase border border-primary/10 mb-4">
                {getCategoryIcon(selectedPost.category)}
                {selectedPost.category}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">{selectedPost.title}</h2>
              <div className="text-muted-foreground leading-relaxed text-lg mb-8 whitespace-pre-wrap">{selectedPost.content}</div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <MessageSquare size={18} /> Discussion ({selectedPost.reactions.discuss})
                  </h3>
                  <span className="text-xs text-muted-foreground">Replies are stored in Supabase.</span>
                </div>

                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                  {(commentThreads[selectedPost.id] || []).length > 0 ? (
                    (commentThreads[selectedPost.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border bg-secondary/10 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-foreground text-sm">{comment.author}</div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              {comment.role} • {comment.timestamp}
                            </div>
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
                      onChange={(event) => setCommentDraft(event.target.value)}
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
                    <Link
                      href="/login"
                      className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all inline-block"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl p-8 relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
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
                <p className="text-muted-foreground mb-6">Join the community first so you can create posts and comment live.</p>
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
                {formError && <div className="mb-4 text-sm text-destructive font-medium">{formError}</div>}
                <input
                  value={newPostTitle}
                  onChange={(event) => setNewPostTitle(event.target.value)}
                  placeholder="Post title"
                  className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  value={newPostContent}
                  onChange={(event) => setNewPostContent(event.target.value)}
                  placeholder="Write your post content..."
                  className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-foreground h-28 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select
                  value={newPostCategory}
                  onChange={(event) => setNewPostCategory(event.target.value as (typeof CATEGORIES)[number])}
                  className="w-full mb-4 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option>Hiring</option>
                  <option>Career Tips</option>
                  <option>Industry News</option>
                </select>
                <button
                  type="button"
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