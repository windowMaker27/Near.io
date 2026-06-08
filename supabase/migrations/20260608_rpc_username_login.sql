-- Drop l'ancienne version (paramètre nommé user_id)
DROP FUNCTION IF EXISTS public.get_email_by_user_id(uuid);

-- Recrée avec p_user_id pour éviter l'ambiguïté SQL
CREATE OR REPLACE FUNCTION public.get_email_by_user_id(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = p_user_id LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_email_by_user_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_user_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_user_id(uuid) TO authenticated;
