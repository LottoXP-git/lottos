CREATE TABLE public.app_version_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_version_name text NOT NULL DEFAULT '1.0.0',
  force_update boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_version_config TO anon;
GRANT SELECT ON public.app_version_config TO authenticated;
GRANT ALL ON public.app_version_config TO service_role;

ALTER TABLE public.app_version_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read version config"
  ON public.app_version_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.app_version_config (min_version_name, force_update, updated_at)
VALUES ('1.0.0', false, now());