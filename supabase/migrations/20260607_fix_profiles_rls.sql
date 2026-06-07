-- Fix: allow anon/authenticated users to insert their own profile row on sign-up
-- The trigger runs as SECURITY DEFINER so it bypasses RLS, but if the app
-- inserts directly (e.g. upsert in authService), the policy below is required.

-- Drop the old insert policy if it exists (idempotent)
drop policy if exists "Users can insert own profile" on public.profiles;

-- Allow any authenticated user (including brand-new accounts whose JWT role
-- is 'authenticated' immediately after sign-up) to insert a row for themselves.
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Ensure the anon role cannot insert (safety net; only authenticated can)
-- This is already the default when enable_rls is on, but stated explicitly:
drop policy if exists "Anon cannot insert profiles" on public.profiles;
create policy "Anon cannot insert profiles"
  on public.profiles
  for insert
  to anon
  with check (false);
