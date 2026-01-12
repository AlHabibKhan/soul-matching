-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System manages rate limits" ON public.proposal_rate_limits;

-- Rate limits are managed by the SECURITY DEFINER function send_proposal
-- which bypasses RLS. No additional permissive policy needed.
-- Users can only view their own rate limit (already configured)