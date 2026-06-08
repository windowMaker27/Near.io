-- ============================================================
-- 1. RLS : INSERT sur place_submissions pour les users connectés
-- ============================================================
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon + authenticated)
DROP POLICY IF EXISTS "place_submissions_select" ON public.place_submissions;
CREATE POLICY "place_submissions_select"
  ON public.place_submissions FOR SELECT
  USING (true);

-- Insertion réservée aux utilisateurs connectés
DROP POLICY IF EXISTS "place_submissions_insert" ON public.place_submissions;
CREATE POLICY "place_submissions_insert"
  ON public.place_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 2. Fonction RPC : résoudre email depuis user_id
--    Utilisée par authService.signIn() pour le login par username.
--    SECURITY DEFINER : s'exécute avec les droits du owner (postgres)
--    pour accéder à auth.users sans exposer la table.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_email_by_user_id(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Accès uniquement aux utilisateurs authentifiés et à anon (pour le login)
REVOKE ALL ON FUNCTION public.get_email_by_user_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_user_id(uuid) TO anon, authenticated;
