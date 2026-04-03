
-- =============================================
-- FIX 1: Remove direct INSERT/UPDATE on proposal_rate_limits for users
-- The send_proposal() SECURITY DEFINER function already manages rate limits
-- =============================================

DROP POLICY IF EXISTS "Users can insert own rate limit" ON public.proposal_rate_limits;
DROP POLICY IF EXISTS "Users can update own rate limit" ON public.proposal_rate_limits;

-- =============================================
-- FIX 2: Replace the permissive profiles SELECT policy with one that
-- only exposes non-sensitive columns. We do this by:
-- 1. Dropping the overly broad policy
-- 2. Revoking SELECT on sensitive columns from authenticated/anon
-- 3. Re-granting SELECT only on safe columns
-- =============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view approved profiles basic info" ON public.profiles;

-- Revoke all column-level SELECT, then re-grant only safe columns
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;

-- Grant SELECT only on non-sensitive columns to authenticated
GRANT SELECT (
  id, user_id, full_name, gender, city, education, profession,
  marital_status, bio, requirements, profile_picture_url,
  date_of_birth, is_verified, is_approved, is_featured, is_blocked,
  created_at, updated_at
) ON public.profiles TO authenticated;

-- Grant SELECT only on non-sensitive columns to anon (for public profile browsing)
GRANT SELECT (
  id, user_id, full_name, gender, city, education, profession,
  marital_status, bio, requirements, profile_picture_url,
  date_of_birth, is_verified, is_approved, is_featured, is_blocked,
  created_at, updated_at
) ON public.profiles TO anon;

-- Re-create the policy for viewing approved profiles (now safe because column-level grants exclude sensitive data)
CREATE POLICY "Users can view approved profiles basic info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (is_approved = true AND is_blocked = false)
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);
