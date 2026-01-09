-- Add requirements field to profiles
ALTER TABLE public.profiles ADD COLUMN requirements text;

-- Create proposals table for the proposal system
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable RLS on proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for proposals
-- Users can view proposals they sent or received
CREATE POLICY "Users can view their own proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send proposals
CREATE POLICY "Users can send proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Receivers can update proposals (accept/reject)
CREATE POLICY "Receivers can update proposal status"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Admins can manage all proposals
CREATE POLICY "Admins can manage all proposals"
  ON public.proposals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to check if contact is visible (proposal accepted)
CREATE OR REPLACE FUNCTION public.can_view_contact(_viewer_id uuid, _profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Can view own contact
    _viewer_id = _profile_user_id
    OR
    -- Admin can view all
    public.has_role(_viewer_id, 'admin')
    OR
    -- Proposal was accepted between these users
    EXISTS (
      SELECT 1 FROM public.proposals
      WHERE status = 'accepted'
      AND (
        (sender_id = _viewer_id AND receiver_id = _profile_user_id)
        OR
        (sender_id = _profile_user_id AND receiver_id = _viewer_id)
      )
    )
$$;