# NexHire

NexHire is an AI-assisted hiring platform built with Next.js and Supabase. It combines candidate dashboards, recruiter tools, semantic job matching, and a public community area so the product feels closer to a real hiring network than a demo app.

## What Users See

- Auth-aware navigation that changes based on session state.
- Candidate dashboards with profile strength, recent activity, and AI match tools.
- Public and dashboard-specific AI match flows.
- Recruiter pages for company setup, candidate search, job detail review, and job posting.
- A community feed and public marketing pages for jobs, pricing, privacy, terms, and cookies.
- Theme-consistent light and dark UI styling across the app.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4, next-themes, Lucide icons
- **Backend**: Next.js route handlers and server actions
- **Auth and Database**: Supabase Auth and Supabase Postgres
- **AI and Matching**: Hugging Face embeddings, Groq-powered insights, semantic ranking utilities
- **Document Handling**: pdf-parse for resume parsing
- **Deployment**: Vercel via GitHub

## Project Structure

- `src/app` contains the route groups for public pages, auth, dashboard, recruiter flows, and API endpoints.
- `src/components` contains shared layout pieces and feature-specific UI.
- `src/lib` contains Supabase clients and matching helpers.
- `supabase/migrations` contains the database schema and follow-up schema changes.

## Prerequisites

- Node.js 20 or newer.
- A Supabase project with the database schema applied.
- A Hugging Face access token for embedding generation.
- A Groq API key for AI insight generation.

## Environment Variables

Create a local `.env.local` file with the values your deployment uses:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
HUGGING_FACE_ACCESS_TOKEN=your-hugging-face-token
GROQ_API_KEY=your-groq-api-key
```

`SUPABASE_SERVICE_ROLE_KEY` is recommended for admin-style operations such as seed or maintenance endpoints.

## Getting Started

1. Clone the repository.

```bash
git clone https://github.com/LAZERAI/nexthire.git
cd nexthire
```

2. Install dependencies.

```bash
npm install
```

3. Apply the Supabase migrations.

Use the SQL files under `supabase/migrations` to create or update the schema in your Supabase project.

4. Configure your environment variables.

Create `.env.local` with the variables above.

5. Run the development server.

```bash
npm run dev
```

6. Open the app.

Visit [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` starts the local Next.js development server.
- `npm run build` builds the production app.
- `npm run start` runs the production server after a build.
- `npm run lint` runs ESLint.

## Architecture Notes

- Candidate and recruiter experiences are split into separate route groups under `src/app`.
- The semantic matching flow depends on job embeddings being present in Supabase.
- AI match and insight endpoints use server-side route handlers so secrets stay off the client.
- The public and dashboard AI match views intentionally use separate routes.

## Deployment

The repository is intended to deploy through Vercel from GitHub. Pushes to `main` should be treated as the production source of truth.

## Learn More

- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Vercel deployment documentation: https://vercel.com/docs
