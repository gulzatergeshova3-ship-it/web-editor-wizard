
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS checked_in_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS registrations_checked_in_at_idx ON public.registrations(checked_in_at);
CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON public.registrations(created_at DESC);

DROP POLICY IF EXISTS "Admins update registrations" ON public.registrations;
CREATE POLICY "Admins update registrations" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.checkin_registration(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.registrations%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO r FROM public.registrations
   WHERE qr_token = _token OR registration_code = _token
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','invalid');
  END IF;

  IF r.checked_in_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status','already',
      'registration', to_jsonb(r)
    );
  END IF;

  UPDATE public.registrations
     SET checked_in_at = now(), checked_in_by = auth.uid()
   WHERE id = r.id
   RETURNING * INTO r;

  RETURN jsonb_build_object('status','ok','registration', to_jsonb(r));
END $$;

GRANT EXECUTE ON FUNCTION public.checkin_registration(text) TO authenticated;
