create table public.ebook_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  subject text,
  category text,
  pages integer default 30,
  blocks jsonb default '[]'::jsonb,
  theme text default 'midnight',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ebook_projects enable row level security;

create policy "Users can view their own ebook projects"
  on public.ebook_projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own ebook projects"
  on public.ebook_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ebook projects"
  on public.ebook_projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ebook projects"
  on public.ebook_projects for delete
  using (auth.uid() = user_id);

create trigger ebook_projects_updated_at
  before update on public.ebook_projects
  for each row execute function public.update_updated_at_column();