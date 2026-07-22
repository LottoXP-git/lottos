-- 1. Extensions for scheduled tasks + HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Table: one row per lottery id, holds the latest known concurso + payload
CREATE TABLE public.lottery_latest (
  id text PRIMARY KEY,
  concurso integer NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Grants — public read, writes only via edge functions (service role)
GRANT SELECT ON public.lottery_latest TO anon, authenticated;
GRANT ALL ON public.lottery_latest TO service_role;

-- 4. RLS: public read, deny writes from client roles
ALTER TABLE public.lottery_latest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read lottery_latest"
  ON public.lottery_latest FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Deny insert on lottery_latest"
  ON public.lottery_latest AS RESTRICTIVE FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Deny update on lottery_latest"
  ON public.lottery_latest AS RESTRICTIVE FOR UPDATE
  TO public
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny delete on lottery_latest"
  ON public.lottery_latest AS RESTRICTIVE FOR DELETE
  TO public
  USING (false);

-- 5. updated_at trigger
CREATE TRIGGER update_lottery_latest_updated_at
  BEFORE UPDATE ON public.lottery_latest
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Realtime: full row payloads + add to publication
ALTER TABLE public.lottery_latest REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_latest;