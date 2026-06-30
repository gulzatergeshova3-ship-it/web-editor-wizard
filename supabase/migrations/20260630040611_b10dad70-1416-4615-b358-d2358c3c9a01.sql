DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
CREATE POLICY "Anyone can submit valid registration"
ON public.registrations
FOR INSERT
TO public
WITH CHECK (
  length(trim(full_name)) > 0
  AND length(trim(email)) > 3
  AND email LIKE '%@%'
);