-- Create is_admin() RPC function for server-side admin verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Create validation trigger for profile fields
CREATE OR REPLACE FUNCTION public.validate_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate phone format (Pakistani format: 03XX-XXXXXXX or 03XXXXXXXXX)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone !~ '^03[0-9]{2}-?[0-9]{7}$' THEN
      RAISE EXCEPTION 'Invalid phone format. Use: 03XX-XXXXXXX';
    END IF;
  END IF;
  
  -- Validate WhatsApp format (same as phone)
  IF NEW.whatsapp IS NOT NULL AND NEW.whatsapp != '' THEN
    IF NEW.whatsapp !~ '^03[0-9]{2}-?[0-9]{7}$' THEN
      RAISE EXCEPTION 'Invalid WhatsApp format. Use: 03XX-XXXXXXX';
    END IF;
  END IF;
  
  -- Validate date of birth (must be 18+ years old and not in future)
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NEW.date_of_birth > CURRENT_DATE THEN
      RAISE EXCEPTION 'Date of birth cannot be in the future';
    END IF;
    IF NEW.date_of_birth > CURRENT_DATE - INTERVAL '18 years' THEN
      RAISE EXCEPTION 'User must be at least 18 years old';
    END IF;
    IF NEW.date_of_birth < CURRENT_DATE - INTERVAL '100 years' THEN
      RAISE EXCEPTION 'Invalid date of birth';
    END IF;
  END IF;
  
  -- Validate gender (must be male or female)
  IF NEW.gender IS NOT NULL AND NEW.gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Gender must be male or female';
  END IF;
  
  -- Validate text field lengths
  IF NEW.full_name IS NOT NULL AND length(NEW.full_name) > 200 THEN
    RAISE EXCEPTION 'Full name must be less than 200 characters';
  END IF;
  
  IF NEW.bio IS NOT NULL AND length(NEW.bio) > 2000 THEN
    RAISE EXCEPTION 'Bio must be less than 2000 characters';
  END IF;
  
  IF NEW.requirements IS NOT NULL AND length(NEW.requirements) > 2000 THEN
    RAISE EXCEPTION 'Requirements must be less than 2000 characters';
  END IF;
  
  IF NEW.profession IS NOT NULL AND length(NEW.profession) > 100 THEN
    RAISE EXCEPTION 'Profession must be less than 100 characters';
  END IF;
  
  IF NEW.city IS NOT NULL AND length(NEW.city) > 100 THEN
    RAISE EXCEPTION 'City must be less than 100 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_fields_trigger ON public.profiles;
CREATE TRIGGER validate_profile_fields_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_fields();