REVOKE SELECT, INSERT, UPDATE, DELETE ON public.app_user_connections FROM authenticated;

DROP POLICY IF EXISTS "Owner can read own encrypted LinkedIn connection" ON public.app_user_connections;
DROP POLICY IF EXISTS "Owner can create own encrypted LinkedIn connection" ON public.app_user_connections;
DROP POLICY IF EXISTS "Owner can update own encrypted LinkedIn connection" ON public.app_user_connections;