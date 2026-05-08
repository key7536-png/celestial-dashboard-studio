create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  chat_type text not null check (chat_type in ('saju','couple','tarot','relation','free')),
  client_name text not null,
  input_data jsonb not null default '{}'::jsonb,
  generated_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "Users view own chat sessions" on public.chat_sessions
  for select using (auth.uid() = user_id);
create policy "Users insert own chat sessions" on public.chat_sessions
  for insert with check (auth.uid() = user_id);
create policy "Users update own chat sessions" on public.chat_sessions
  for update using (auth.uid() = user_id);
create policy "Users delete own chat sessions" on public.chat_sessions
  for delete using (auth.uid() = user_id);

create index chat_sessions_user_type_idx on public.chat_sessions(user_id, chat_type, created_at desc);

create trigger chat_sessions_updated
  before update on public.chat_sessions
  for each row execute function public.update_updated_at_column();