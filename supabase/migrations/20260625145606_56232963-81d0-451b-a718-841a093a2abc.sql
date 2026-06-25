-- Tighten user_registrations INSERT policy: replace WITH CHECK (true) with real validations
DROP POLICY IF EXISTS "Anyone can register" ON public.user_registrations;

CREATE POLICY "Public can register with valid data"
ON public.user_registrations
FOR INSERT
TO public
WITH CHECK (
  length(full_name) BETWEEN 2 AND 120
  AND length(phone) BETWEEN 8 AND 32
  AND phone ~ '^[0-9+()\-\s]+$'
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND birth_date IS NOT NULL
  AND birth_date <= (CURRENT_DATE - INTERVAL '18 years')
  AND birth_date >= '1900-01-01'::date
  AND array_length(favorite_lotteries, 1) IS NULL
       OR array_length(favorite_lotteries, 1) <= 20
);

-- Explicit deny for SELECT/UPDATE/DELETE to make intent unambiguous (defense in depth)
DROP POLICY IF EXISTS "Deny select on user_registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Deny update on user_registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Deny delete on user_registrations" ON public.user_registrations;

CREATE POLICY "Deny select on user_registrations"
ON public.user_registrations AS RESTRICTIVE FOR SELECT TO public USING (false);

CREATE POLICY "Deny update on user_registrations"
ON public.user_registrations AS RESTRICTIVE FOR UPDATE TO public USING (false) WITH CHECK (false);

CREATE POLICY "Deny delete on user_registrations"
ON public.user_registrations AS RESTRICTIVE FOR DELETE TO public USING (false);