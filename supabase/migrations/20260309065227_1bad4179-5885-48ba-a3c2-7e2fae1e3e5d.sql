-- Function to look up email by phone number (for login with phone)
CREATE OR REPLACE FUNCTION public.get_email_by_phone(_phone text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM public.customers
  WHERE phone = _phone
  LIMIT 1;
$$;