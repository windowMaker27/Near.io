-- Schema Near.io — à exécuter dans l'éditeur SQL Supabase
-- Catégories valides : supermarket | convenience | bakery | grocery | organic | halal
--                      pharmacy | fast_food | restaurant | other | street_vendor | unknown

create table if not exists place_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  latitude        float8 not null,
  longitude       float8 not null,
  short_address   text,
  opening_hours   text,          -- OSM-like string (ex: "Lu-Ve 08h-20h ; Sa 10h-18h")
  description     text,
  submitted_at    timestamptz default now(),
  status          text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  -- Colonnes pour scraping futur (Google Maps / Selenium)
  opening_hours_structured  jsonb,   -- { mo:{open,close}, tu:{open,close}, ... }
  phone                     text,
  website                   text,
  google_place_id           text,
  last_scraped_at           timestamptz
);

-- Index pour les requêtes géographiques bbox
create index if not exists idx_submissions_lat    on place_submissions (latitude);
create index if not exists idx_submissions_lon    on place_submissions (longitude);
create index if not exists idx_submissions_status on place_submissions (status);
create index if not exists idx_submissions_google on place_submissions (google_place_id)
  where google_place_id is not null;

-- RLS
alter table place_submissions enable row level security;

create policy "Soumission publique"
  on place_submissions for insert
  to anon
  with check (true);

create policy "Lecture publique approuvés"
  on place_submissions for select
  to anon
  using (status = 'approved');

create policy "allow_anon_insert"
  on place_submissions for insert
  to anon
  with check (true);

create policy "allow_anon_read"
  on place_submissions for select
  to anon
  using (status = 'approved');

-- -----------------------------------------------------------------------
-- MIGRATION : ajouter les colonnes scraping si la table existe déjà
-- Exécuter uniquement si la table était déjà créée sans ces colonnes :
-- -----------------------------------------------------------------------
-- alter table place_submissions
--   add column if not exists opening_hours_structured jsonb,
--   add column if not exists phone text,
--   add column if not exists website text,
--   add column if not exists google_place_id text,
--   add column if not exists last_scraped_at timestamptz;
