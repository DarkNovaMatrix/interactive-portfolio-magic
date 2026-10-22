CREATE TABLE public.linkedin_profile_snapshots (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL,
  picture_url text,
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.linkedin_profile_snapshots TO authenticated;
GRANT SELECT (display_name, picture_url, published, updated_at) ON public.linkedin_profile_snapshots TO anon;
GRANT ALL ON public.linkedin_profile_snapshots TO service_role;

ALTER TABLE public.linkedin_profile_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published LinkedIn profile"
ON public.linkedin_profile_snapshots FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Owner can read LinkedIn profile draft"
ON public.linkedin_profile_snapshots FOR SELECT TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can create LinkedIn profile draft"
ON public.linkedin_profile_snapshots FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner can update LinkedIn profile"
ON public.linkedin_profile_snapshots FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));