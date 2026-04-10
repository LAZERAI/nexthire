-- Add titles to community posts so feed cards can be stored and rendered consistently.
alter table public.posts
add column if not exists title text;

-- Persistent comments for community posts.
create table if not exists public.post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_post_comments_post_created_at
  on public.post_comments (post_id, created_at desc);

alter table public.post_comments enable row level security;
create policy "Comments are viewable by everyone." on public.post_comments
  for select using (true);
create policy "Authors can manage their comments." on public.post_comments
  for all using (auth.uid() = author_id);