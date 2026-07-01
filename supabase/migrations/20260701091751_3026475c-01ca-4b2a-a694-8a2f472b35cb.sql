
CREATE OR REPLACE FUNCTION public.checkin_registration(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  found_id uuid;
  prev_at timestamptz;
  updated public.registrations%ROWTYPE;
  r public.registrations%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Lock the row to serialize concurrent scans of the same QR
  SELECT id, checked_in_at INTO found_id, prev_at
    FROM public.registrations
   WHERE qr_token = _token OR registration_code = _token
   LIMIT 1
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','invalid');
  END IF;

  IF prev_at IS NOT NULL THEN
    SELECT * INTO r FROM public.registrations WHERE id = found_id;
    RETURN jsonb_build_object('status','already','registration', to_jsonb(r));
  END IF;

  UPDATE public.registrations
     SET checked_in_at = now(), checked_in_by = auth.uid()
   WHERE id = found_id
   RETURNING * INTO updated;

  RETURN jsonb_build_object('status','ok','registration', to_jsonb(updated));
END $function$;
