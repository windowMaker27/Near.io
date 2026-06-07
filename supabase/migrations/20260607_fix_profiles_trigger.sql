-- ============================================================
-- Fix: création du profil via trigger SECURITY DEFINER
-- Le client ne fait plus d'INSERT direct sur profiles —
-- Postgres le fait automatiquement à chaque nouveau auth.user.
-- ============================================================

-- 1. Supprimer l'ancienne policy insert si elle existe
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Anon cannot insert profiles" on public.profiles;

-- 2. Fonction trigger (s'exécute avec les droits superuser, bypass RLS)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Attacher le trigger sur auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Note: retirer l'upsert de profil dans authService.ts (signUp)
-- Le trigger s'en charge — le client peut juste appeler supabase.auth.signUp()
-- avec { data: { username } } dans les options.
