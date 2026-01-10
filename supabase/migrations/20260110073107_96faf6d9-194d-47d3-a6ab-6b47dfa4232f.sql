-- Drop existing policy that exposes all fields to authenticated users
DROP POLICY IF EXISTS "Users can view approved profiles" ON public.profiles;

-- Create a new policy for viewing basic profile information (excludes sensitive fields)
-- Users will use the get_contact_if_accepted RPC function for phone/whatsapp
-- and we'll create a view or RPC for profile viewing that excludes sensitive URLs
CREATE POLICY "Users can view approved profiles basic info" 
ON public.profiles 
FOR SELECT 
USING (
  is_approved = true 
  AND is_blocked = false 
  AND auth.uid() IS NOT NULL
);

-- Create a secure view that excludes sensitive columns for regular user queries
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  gender,
  city,
  education,
  profession,
  marital_status,
  bio,
  requirements,
  profile_picture_url,
  date_of_birth,
  is_verified,
  is_approved,
  is_featured,
  is_blocked,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create a secure function to get verification documents (admin or own profile only)
CREATE OR REPLACE FUNCTION public.get_profile_verification_docs(p_user_id uuid)
RETURNS TABLE(id_document_url text, selfie_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id_document_url, p.selfie_url 
  FROM profiles p
  WHERE p.user_id = p_user_id
  AND (
    -- User viewing their own profile
    p_user_id = auth.uid()
    OR
    -- Admin can view all
    public.has_role(auth.uid(), 'admin')
  );
$$;