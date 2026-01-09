-- Fix 1: Create atomic send_proposal function to prevent race conditions
CREATE OR REPLACE FUNCTION public.send_proposal(
  p_sender_id UUID,
  p_receiver_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package_id UUID;
  v_remaining INT;
BEGIN
  -- Verify the sender is the authenticated user
  IF p_sender_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized'
    );
  END IF;

  -- Lock the package row to prevent race conditions
  SELECT id, proposals_remaining 
  INTO v_package_id, v_remaining
  FROM user_packages
  WHERE user_id = p_sender_id
    AND payment_status = 'approved'
    AND expires_at > NOW()
    AND proposals_remaining > 0
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE NOWAIT;

  -- Check if package found
  IF v_package_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active package with proposals remaining'
    );
  END IF;

  -- Check if proposal already exists (duplicate prevention)
  IF EXISTS (
    SELECT 1 FROM proposals
    WHERE sender_id = p_sender_id AND receiver_id = p_receiver_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposal already sent to this profile'
    );
  END IF;

  -- Insert proposal atomically
  INSERT INTO proposals (sender_id, receiver_id, status)
  VALUES (p_sender_id, p_receiver_id, 'pending');

  -- Atomically decrement counter
  UPDATE user_packages
  SET proposals_remaining = proposals_remaining - 1
  WHERE id = v_package_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'remaining', v_remaining - 1
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposal already sent'
    );
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Please wait and try again'
    );
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.send_proposal TO authenticated;

-- Fix 2: Drop and recreate the user profile update policy with restrictions on admin fields
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent modification of admin-only fields by comparing to current values
    is_approved = (SELECT p.is_approved FROM profiles p WHERE p.user_id = auth.uid()) AND
    is_blocked = (SELECT p.is_blocked FROM profiles p WHERE p.user_id = auth.uid()) AND
    is_verified = (SELECT p.is_verified FROM profiles p WHERE p.user_id = auth.uid()) AND
    is_featured = (SELECT p.is_featured FROM profiles p WHERE p.user_id = auth.uid())
  );