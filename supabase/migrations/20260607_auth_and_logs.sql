-- ============================================================
-- Near.io — Auth & Logs migration
-- À exécuter dans l'éditeur SQL du dashboard Supabase
-- ============================================================

-- 1. Table profiles (liée à auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- RLS profiles
alter table public.profiles enable row level security;

create policy "Lecture publique des profils"
  on public.profiles for select using (true);

create policy "Mise à jour par le propriétaire"
  on public.profiles for update using (auth.uid() = id);

-- 2. Table place_logs
create table if not exists public.place_logs (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null,        -- id Near.io (ex: "osm-123" ou "user-abc")
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null check (char_length(content) <= 150),
  created_at  timestamptz not null default now()
);

create index if not exists place_logs_place_id_idx on public.place_logs(place_id);
create index if not exists place_logs_created_at_idx on public.place_logs(created_at);

-- RLS place_logs
alter table public.place_logs enable row level security;

create policy "Lecture publique des logs"
  on public.place_logs for select using (true);

create policy "Insertion par utilisateurs connectés"
  on public.place_logs for insert with check (auth.uid() = user_id);

create policy "Suppression par auteur ou admin"
  on public.place_logs for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
