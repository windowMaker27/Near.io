-- ============================================================
-- RPC : résoudre email depuis user_id
-- Paramètre renommé p_user_id pour éviter toute ambiguïté.
-- SECURITY DEFINER : s'exécute avec les droits du owner (postgres)
-- pour accéder à auth.users sans l'exposer.
-- Accessible à anon (nécessaire avant que la session soit établie)
-- et authenticated.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_email_by_user_id(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = p_user_id LIMIT 1;
$$;

-- Révoque tout accès par défaut, puis accorde explicitement
REVOKE ALL ON FUNCTION public.get_email_by_user_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_user_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_user_id(uuid) TO authenticated;
