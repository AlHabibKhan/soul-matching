-- Create storage buckets for secure file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('payment-proofs', 'payment-proofs', false),
  ('id-documents', 'id-documents', false),
  ('profile-pictures', 'profile-pictures', true);

-- Payment proofs: users upload own, admins view all
CREATE POLICY "Users upload own payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins view all payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

-- ID documents: users upload/view own, admins view all
CREATE POLICY "Users upload own ID docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'id-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own ID docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'id-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins view all ID docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'id-documents' AND public.has_role(auth.uid(), 'admin'));

-- Profile pictures: users upload own, all authenticated users can view
CREATE POLICY "Users upload own profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

-- Add rate limiting table for proposal sending
CREATE TABLE public.proposal_rate_limits (
  user_id UUID PRIMARY KEY,
  last_proposal_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  proposals_in_window INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limit table
ALTER TABLE public.proposal_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own rate limit
CREATE POLICY "Users view own rate limit"
  ON public.proposal_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage rate limits (via RPC)
CREATE POLICY "System manages rate limits"
  ON public.proposal_rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update send_proposal function to include rate limiting
CREATE OR REPLACE FUNCTION public.send_proposal(p_sender_id uuid, p_receiver_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_package_id UUID;
  v_remaining INT;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_proposals_in_window INT;
  v_rate_limit_window INTERVAL := INTERVAL '5 minutes';
  v_max_proposals_per_window INT := 5;
BEGIN
  -- Verify the sender is the authenticated user
  IF p_sender_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized'
    );
  END IF;

  -- Check rate limit
  SELECT window_start, proposals_in_window
  INTO v_window_start, v_proposals_in_window
  FROM proposal_rate_limits
  WHERE user_id = p_sender_id
  FOR UPDATE;

  IF FOUND THEN
    -- Check if window has expired
    IF v_window_start < NOW() - v_rate_limit_window THEN
      -- Reset window
      UPDATE proposal_rate_limits
      SET window_start = NOW(), proposals_in_window = 1, last_proposal_at = NOW()
      WHERE user_id = p_sender_id;
    ELSIF v_proposals_in_window >= v_max_proposals_per_window THEN
      -- Rate limit exceeded
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Rate limit exceeded. Please wait a few minutes before sending more proposals.'
      );
    ELSE
      -- Increment counter
      UPDATE proposal_rate_limits
      SET proposals_in_window = proposals_in_window + 1, last_proposal_at = NOW()
      WHERE user_id = p_sender_id;
    END IF;
  ELSE
    -- First proposal - create rate limit record
    INSERT INTO proposal_rate_limits (user_id, last_proposal_at, proposals_in_window, window_start)
    VALUES (p_sender_id, NOW(), 1, NOW());
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
$function$;