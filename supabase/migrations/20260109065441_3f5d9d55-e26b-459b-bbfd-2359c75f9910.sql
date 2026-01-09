-- Create function to get contact info only when proposal is accepted
CREATE OR REPLACE FUNCTION public.get_contact_if_accepted(p_profile_user_id UUID)
RETURNS TABLE(phone TEXT, whatsapp TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.phone, p.whatsapp 
  FROM profiles p
  WHERE p.user_id = p_profile_user_id
  AND (
    -- User viewing their own profile
    p_profile_user_id = auth.uid()
    OR
    -- Admin can view all
    public.has_role(auth.uid(), 'admin')
    OR
    -- Accepted proposal exists
    EXISTS (
      SELECT 1 FROM proposals
      WHERE status = 'accepted'
      AND (
        (sender_id = auth.uid() AND receiver_id = p_profile_user_id)
        OR
        (receiver_id = auth.uid() AND sender_id = p_profile_user_id)
      )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_contact_if_accepted TO authenticated;