import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PackagesSection from "@/components/PackagesSection";
import { User, MapPin, GraduationCap, Briefcase, Heart, Calendar, Phone, MessageCircle, Send, Check, X } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: string;
  date_of_birth?: string;
  city?: string;
  education?: string;
  profession?: string;
  marital_status?: string;
  bio?: string;
  requirements?: string;
  profile_picture_url?: string;
}

interface ContactInfo {
  phone?: string;
  whatsapp?: string;
}

interface Proposal {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
}

interface UserPackage {
  id: string;
  proposals_remaining: number;
}

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const Profiles = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [canViewContact, setCanViewContact] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id);
        fetchProposals(session.user.id);
        fetchUserPackage(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfiles(session.user.id);
        fetchProposals(session.user.id);
        fetchUserPackage(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPackage = async (userId: string) => {
    const { data } = await supabase
      .from("user_packages")
      .select("id, proposals_remaining")
      .eq("user_id", userId)
      .eq("payment_status", "approved")
      .gt("expires_at", new Date().toISOString())
      .gt("proposals_remaining", 0)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setUserPackage(data);
  };

  const fetchProfiles = async (userId: string) => {
    // Fetch all approved profiles except current user
    // SECURITY: phone/whatsapp are NOT fetched here to prevent data leakage
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, gender, date_of_birth, city, education, profession, marital_status, bio, requirements, profile_picture_url")
      .eq("is_approved", true)
      .eq("is_blocked", false)
      .neq("user_id", userId);

    if (data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  // Securely fetch contact info only when authorized (proposal accepted)
  const fetchContactInfo = async (profileUserId: string) => {
    const { data, error } = await supabase.rpc('get_contact_if_accepted', {
      p_profile_user_id: profileUserId
    });
    
    if (data && data.length > 0) {
      setContactInfo(data[0]);
      return true;
    }
    setContactInfo(null);
    return false;
  };

  const fetchProposals = async (userId: string) => {
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (data) {
      setProposals(data);
    }
  };

  const getProposalStatus = (profileUserId: string): { status: string; isSender: boolean } | null => {
    if (!user) return null;
    
    const proposal = proposals.find(
      p => (p.sender_id === user.id && p.receiver_id === profileUserId) ||
           (p.sender_id === profileUserId && p.receiver_id === user.id)
    );

    if (!proposal) return null;
    return { status: proposal.status, isSender: proposal.sender_id === user.id };
  };

  const sendProposal = async (receiverId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to send proposals",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Check if user has active package before calling RPC
    if (!userPackage) {
      setShowPricingDialog(true);
      return;
    }

    // Call atomic function to prevent race conditions
    const { data, error } = await supabase.rpc('send_proposal', {
      p_sender_id: user.id,
      p_receiver_id: receiverId
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send proposal. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Type the response
    const result = data as { success: boolean; error?: string; remaining?: number } | null;

    if (!result?.success) {
      const errorMessage = result?.error || "Failed to send proposal";
      
      // Show pricing dialog if no active package
      if (errorMessage.includes("No active package")) {
        setShowPricingDialog(true);
        return;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Proposal Sent!",
      description: `${result.remaining ?? 0} proposals remaining.`,
    });

    fetchProposals(user.id);
  };

  const handleProposalResponse = async (senderId: string, accept: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("proposals")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: accept ? "Proposal Accepted!" : "Proposal Rejected",
      description: accept ? "Contact details are now visible to both parties." : "The proposal has been rejected.",
    });

    fetchProposals(user.id);
    if (selectedProfile) {
      setCanViewContact(accept);
      // Securely fetch contact info after acceptance
      if (accept) {
        await fetchContactInfo(senderId);
      } else {
        setContactInfo(null);
      }
    }
  };

  const openProfileDetails = async (profile: Profile) => {
    setSelectedProfile(profile);
    setContactInfo(null);
    
    // Check if contact is visible (proposal accepted)
    const proposalInfo = getProposalStatus(profile.user_id);
    const isConnected = proposalInfo?.status === "accepted";
    setCanViewContact(isConnected);
    
    // Fetch contact info securely via RPC if connected
    if (isConnected) {
      await fetchContactInfo(profile.user_id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">Browse Profiles</h1>
            <p className="text-muted-foreground">Find your perfect match</p>
          </div>

          {!user && (
            <div className="text-center mb-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-2">Login to send proposals and connect</p>
              <Button onClick={() => navigate("/auth")} className="gradient-primary border-0">
                Login / Sign Up
              </Button>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No approved profiles available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => {
                const proposalInfo = getProposalStatus(profile.user_id);
                const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;

                return (
                  <Card 
                    key={profile.id} 
                    className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                    onClick={() => openProfileDetails(profile)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          {profile.profile_picture_url ? (
                            <img 
                              src={profile.profile_picture_url} 
                              alt={profile.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {profile.full_name}
                          </h3>
                          {age && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{age} years</span>
                            </div>
                          )}
                          <Badge variant="secondary" className="mt-1">
                            {profile.gender === "male" ? "Male" : "Female"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {profile.city && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.city}</span>
                        </div>
                      )}
                      {profile.education && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span>{profile.education}</span>
                        </div>
                      )}
                      {profile.profession && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>{profile.profession}</span>
                        </div>
                      )}
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {profile.bio}
                        </p>
                      )}
                      
                      {/* Proposal Status */}
                      <div className="pt-2">
                        {proposalInfo ? (
                          <Badge 
                            variant={
                              proposalInfo.status === "accepted" ? "default" :
                              proposalInfo.status === "rejected" ? "destructive" : "secondary"
                            }
                          >
                            {proposalInfo.status === "pending" && proposalInfo.isSender && "Proposal Sent"}
                            {proposalInfo.status === "pending" && !proposalInfo.isSender && "Proposal Received"}
                            {proposalInfo.status === "accepted" && "Connected"}
                            {proposalInfo.status === "rejected" && "Rejected"}
                          </Badge>
                        ) : user && (
                          <Button 
                            size="sm" 
                            className="gradient-primary border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              sendProposal(profile.user_id);
                            }}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Proposal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedProfile.profile_picture_url ? (
                      <img 
                        src={selectedProfile.profile_picture_url} 
                        alt={selectedProfile.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedProfile.full_name}</DialogTitle>
                    <DialogDescription>
                      {selectedProfile.date_of_birth && `${calculateAge(selectedProfile.date_of_birth)} years • `}
                      {selectedProfile.gender === "male" ? "Male" : "Female"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedProfile.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedProfile.city}</span>
                    </div>
                  )}
                  {selectedProfile.education && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>{selectedProfile.education}</span>
                    </div>
                  )}
                  {selectedProfile.profession && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>{selectedProfile.profession}</span>
                    </div>
                  )}
                  {selectedProfile.marital_status && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>{selectedProfile.marital_status}</span>
                    </div>
                  )}
                </div>

                {/* Bio/Description */}
                {selectedProfile.bio && (
                  <div>
                    <h4 className="font-semibold mb-1">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedProfile.bio}</p>
                  </div>
                )}

                {/* Requirements */}
                {selectedProfile.requirements && (
                  <div>
                    <h4 className="font-semibold mb-1">Looking For</h4>
                    <p className="text-sm text-muted-foreground">{selectedProfile.requirements}</p>
                  </div>
                )}

                {/* Contact Information - Only visible after proposal acceptance */}
                {canViewContact && contactInfo ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-600 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-2">
                      {contactInfo.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{contactInfo.phone}</span>
                        </div>
                      )}
                      {contactInfo.whatsapp && (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          <span>{contactInfo.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Contact information is only visible after proposal acceptance
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {(() => {
                    const proposalInfo = getProposalStatus(selectedProfile.user_id);
                    
                    if (!user) {
                      return (
                        <Button 
                          className="flex-1 gradient-primary border-0"
                          onClick={() => navigate("/auth")}
                        >
                          Login to Connect
                        </Button>
                      );
                    }

                    if (!proposalInfo) {
                      return (
                        <Button 
                          className="flex-1 gradient-primary border-0"
                          onClick={() => sendProposal(selectedProfile.user_id)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Proposal
                        </Button>
                      );
                    }

                    if (proposalInfo.status === "pending" && !proposalInfo.isSender) {
                      return (
                        <>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleProposalResponse(selectedProfile.user_id, true)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleProposalResponse(selectedProfile.user_id, false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      );
                    }

                    return (
                      <Badge 
                        variant={
                          proposalInfo.status === "accepted" ? "default" :
                          proposalInfo.status === "rejected" ? "destructive" : "secondary"
                        }
                        className="w-full justify-center py-2"
                      >
                        {proposalInfo.status === "pending" && "Proposal Pending"}
                        {proposalInfo.status === "accepted" && "Connected ✓"}
                        {proposalInfo.status === "rejected" && "Proposal Rejected"}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gradient">Purchase a Package</DialogTitle>
            <DialogDescription>
              You need an active package to send proposals. Choose a package below to get started.
            </DialogDescription>
          </DialogHeader>
          <PackagesSection 
            userId={user?.id || ""} 
            onPurchase={() => {
              setShowPricingDialog(false);
              if (user) {
                fetchUserPackage(user.id);
              }
              toast({
                title: "Package Purchased!",
                description: "Your payment is under review. You can send proposals once approved.",
              });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profiles;

