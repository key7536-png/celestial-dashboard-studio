create table public.fortune_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth text not null,
  calendar text not null default '양력',
  gender text not null default '여성',
  birth_time text,
  request text,
  part_results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fortune_reports enable row level security;

create policy "own select" on public.fortune_reports for select using (auth.uid() = user_id);
create policy "own insert" on public.fortune_reports for insert with check (auth.uid() = user_id);
create policy "own update" on public.fortune_reports for update using (auth.uid() = user_id);
create policy "own delete" on public.fortune_reports for delete using (auth.uid() = user_id);

create trigger fortune_reports_updated
before update on public.fortune_reports
for each row execute function public.update_updated_at_column();

create index fortune_reports_user_idx on public.fortune_reports(user_id, created_at desc);