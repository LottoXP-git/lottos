-- 1. Drop the existing permissive insert policy to recreate it with stricter WITH CHECK
DROP POLICY IF EXISTS "Anyone can insert ad events" ON public.ad_events;

-- 2. Re-create INSERT policy: still public, but restrict to known event_types and required slot
CREATE POLICY "Public can insert valid ad events"
  ON public.ad_events
  FOR INSERT
  TO public
  WITH CHECK (
    event_type IN ('impression', 'click')
    AND slot IS NOT NULL
    AND length(slot) BETWEEN 1 AND 64
    AND (page IS NULL OR length(page) <= 512)
    AND (format IS NULL OR length(format) <= 32)
    AND (user_agent IS NULL OR length(user_agent) <= 512)
  );

-- 3. Explicit RESTRICTIVE deny policies for SELECT/UPDATE/DELETE.
-- Even if another policy is added later, these will block anon/authenticated access.
-- Service role bypasses RLS, so server-side reads still work.
CREATE POLICY "Deny select on ad_events"
  ON public.ad_events
  AS RESTRICTIVE
  FOR SELECT
  TO public, authenticated
  USING (false);

CREATE POLICY "Deny update on ad_events"
  ON public.ad_events
  AS RESTRICTIVE
  FOR UPDATE
  TO public, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny delete on ad_events"
  ON public.ad_events
  AS RESTRICTIVE
  FOR DELETE
  TO public, authenticated
  USING (false);

-- 4. Defensive validation trigger (server-side enforcement independent of RLS)
CREATE OR REPLACE FUNCTION public.validate_ad_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.event_type NOT IN ('impression', 'click') THEN
    RAISE EXCEPTION 'invalid event_type: %', NEW.event_type;
  END IF;
  IF NEW.slot IS NULL OR length(NEW.slot) = 0 THEN
    RAISE EXCEPTION 'slot is required';
  END IF;
  -- Hard cap field lengths to prevent abuse
  IF NEW.user_agent IS NOT NULL AND length(NEW.user_agent) > 512 THEN
    NEW.user_agent := left(NEW.user_agent, 512);
  END IF;
  IF NEW.page IS NOT NULL AND length(NEW.page) > 512 THEN
    NEW.page := left(NEW.page, 512);
  END IF;
  IF NEW.format IS NOT NULL AND length(NEW.format) > 32 THEN
    NEW.format := left(NEW.format, 32);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_ad_event_trigger ON public.ad_events;
CREATE TRIGGER validate_ad_event_trigger
  BEFORE INSERT ON public.ad_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ad_event();

-- 5. Index for service-role reads (admin dashboard queries by created_at desc)
CREATE INDEX IF NOT EXISTS ad_events_created_at_idx
  ON public.ad_events (created_at DESC);
