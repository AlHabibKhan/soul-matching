-- Add INSERT policy for proposal_rate_limits
-- Users can create their own rate limit records
CREATE POLICY "Users can insert own rate limit"
ON public.proposal_rate_limits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for proposal_rate_limits
-- Users can update their own rate limit records
CREATE POLICY "Users can update own rate limit"
ON public.proposal_rate_limits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);