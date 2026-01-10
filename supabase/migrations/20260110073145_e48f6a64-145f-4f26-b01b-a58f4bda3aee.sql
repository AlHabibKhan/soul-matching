-- Drop the SECURITY DEFINER view as it bypasses RLS
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a SECURITY INVOKER function to get safe profile data
-- This respects RLS and only returns non-sensitive fields
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  gender text,
  city text,
  education text,
  profession text,
  marital_status text,
  bio text,
  requirements text,
  profile_picture_url text,
  date_of_birth date,
  is_verified boolean,
  is_approved boolean,
  is_featured boolean,
  is_blocked boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.gender,
    p.city,
    p.education,
    p.profession,
    p.marital_status,
    p.bio,
    p.requirements,
    p.profile_picture_url,
    p.date_of_birth,
    p.is_verified,
    p.is_approved,
    p.is_featured,
    p.is_blocked,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.is_approved = true AND p.is_blocked = false;
$$;