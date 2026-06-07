-- Schema Near.io — à exécuter dans l'éditeur SQL Supabase

create table if not exists place_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  latitude        float8 not null,
  longitude       float8 not null,
  short_address   text,
  opening_hours   text,
  description     text,
  submitted_at    timestamptz default now(),
  status          text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'))
);

-- Index pour les requêtes géographiques bbox
create index if not exists idx_submissions_lat on place_submissions (latitude);
create index if not exists idx_submissions_lon on place_submissions (longitude);
create index if not exists idx_submissions_status on place_submissions (status);

-- RLS : tout le monde peut insérer (soumission anonyme)
alter table place_submissions enable row level security;

create policy "Soumission publique"
  on place_submissions for insert
  with check (true);

-- Lecture : seulement les lieux approuvés pour les anonymes
create policy "Lecture publique approuvés"
  on place_submissions for select
  using (status = 'approved');

-- Admin (service_role ou authentifié) peut tout faire
-- (géré côté Supabase Dashboard / Studio directement)
