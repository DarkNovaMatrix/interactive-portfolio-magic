GRANT SELECT, INSERT, UPDATE ON public.app_user_connections TO authenticated;

CREATE POLICY "Owner can read own encrypted LinkedIn connection"
ON public.app_user_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id AND connector_id = 'linkedin' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can create own encrypted LinkedIn connection"
ON public.app_user_connections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND connector_id = 'linkedin' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can update own encrypted LinkedIn connection"
ON public.app_user_connections FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND connector_id = 'linkedin' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND connector_id = 'linkedin' AND public.has_role(auth.uid(), 'admin'));