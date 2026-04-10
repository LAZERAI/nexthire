export type CommunitySeedComment = {
  authorSlot: number;
  content: string;
};

export type CommunitySeedPost = {
  title: string;
  content: string;
  category: string;
  helpfulCount: number;
  comments: CommunitySeedComment[];
};

export const COMMUNITY_SEED_POSTS: CommunitySeedPost[] = [
  {
    title: "What makes a hiring post actually work",
    content:
      "Candidates respond when the role, salary, location, and stack are all stated clearly. The best posts I see are the ones that respect a reader's time and make the next step obvious.",
    category: "Hiring",
    helpfulCount: 74,
    comments: [
      { authorSlot: 1, content: "This is exactly what we needed to hear. Clarity saves everyone time." },
      { authorSlot: 2, content: "Transparent salary ranges alone improve reply rates in our process." },
    ],
  },
  {
    title: "How we use RAG without making the product feel like a demo",
    content:
      "The difference between a useful RAG flow and a flashy demo is workflow design. We keep retrieval fast, trim the context aggressively, and make sure the answer can be explained to a non-technical stakeholder.",
    category: "Industry News",
    helpfulCount: 61,
    comments: [
      { authorSlot: 0, content: "Strong point on explanation. Teams forget the human layer around the model." },
      { authorSlot: 3, content: "The context trimming piece is the part most products skip." },
    ],
  },
  {
    title: "Salary negotiation is easier when both sides share range and scope early",
    content:
      "Candidates negotiate better when they know what success looks like, and recruiters get better outcomes when the process is transparent. Hidden ranges waste time for everyone.",
    category: "Career Tips",
    helpfulCount: 88,
    comments: [
      { authorSlot: 2, content: "This is the standard more teams should adopt." },
      { authorSlot: 4, content: "I wish every recruiter shared this up front." },
    ],
  },
  {
    title: "Why smaller teams are shipping faster in 2026",
    content:
      "Smaller teams are leaning on better tooling, stronger defaults, and tighter product scopes. That makes the gap between idea and live feature much smaller than it used to be.",
    category: "Industry News",
    helpfulCount: 53,
    comments: [
      { authorSlot: 1, content: "Tighter scope is underrated. It improves the whole release process." },
      { authorSlot: 5, content: "The best teams I know are very disciplined about what they do not build." },
    ],
  },
  {
    title: "Interview prep that actually changes outcomes",
    content:
      "Build stories around impact, conflict, and execution. Memorizing answers is less effective than being able to explain why a decision mattered and what changed after it landed.",
    category: "Career Tips",
    helpfulCount: 96,
    comments: [
      { authorSlot: 0, content: "Story-based prep is the most practical advice here." },
      { authorSlot: 3, content: "This is what separates rehearsed answers from credible ones." },
    ],
  },
  {
    title: "A better onboarding experience starts before the offer",
    content:
      "Candidates remember how a company handled the process. When the interview loop is clear and the communication is respectful, the product feels more trustworthy before the person even joins.",
    category: "Hiring",
    helpfulCount: 69,
    comments: [
      { authorSlot: 4, content: "The hiring experience is part of the brand now." },
      { authorSlot: 2, content: "A good candidate journey is a strong signal of company culture." },
    ],
  },
];