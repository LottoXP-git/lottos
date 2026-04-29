
CREATE TABLE IF NOT EXISTS public.ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('impression','click')),
  page text,
  format text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_events_slot_idx ON public.ad_events (slot);
CREATE INDEX IF NOT EXISTS ad_events_created_at_idx ON public.ad_events (created_at DESC);
CREATE INDEX IF NOT EXISTS ad_events_slot_type_idx ON public.ad_events (slot, event_type);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ad events"
  ON public.ad_events
  FOR INSERT
  TO public
  WITH CHECK (true);
