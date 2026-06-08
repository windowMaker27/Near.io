-- ============================================================
-- 1. Ajout colonne email dans profiles
--    Permet le login par username sans RPC SECURITY DEFINER.
--    Remplie par le trigger on_auth_user_created.
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Backfill depuis auth.users pour les comptes existants
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- ============================================================
-- 2. Mise à jour du trigger pour stocker l'email
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    'user',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. RLS sur place_submissions
--    SELECT public, INSERT pour authenticated uniquement
-- ============================================================
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "place_submissions_select" ON public.place_submissions;
CREATE POLICY "place_submissions_select"
  ON public.place_submissions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "place_submissions_insert" ON public.place_submissions;
CREATE POLICY "place_submissions_insert"
  ON public.place_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant explicite sur la table pour le rôle authenticated
GRANT INSERT ON public.place_submissions TO authenticated;
GRANT SELECT ON public.place_submissions TO anon, authenticated;

-- ============================================================
-- 4. Supprime la RPC de la migration précédente (plus nécessaire)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_email_by_user_id(uuid);
