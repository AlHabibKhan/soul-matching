import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Users, Package, CreditCard, Check, X, Shield } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: string;
  city?: string;
  is_approved: boolean;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface PendingPayment {
  id: string;
  user_id: string;
  payment_status: string;
  payment_proof_url?: string;
  created_at: string;
  profiles: { full_name: string };
  packages: { name: string; price_pkr: number };
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    // Use server-side RPC function for admin verification
    const { data: isAdminResult, error } = await supabase.rpc('is_admin');

    if (error || !isAdminResult) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchProfiles();
    fetchPendingPayments();
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProfiles(data);
    }
  };

  const fetchPendingPayments = async () => {
    const { data } = await supabase
      .from("user_packages")
      .select("*, profiles!user_packages_user_id_fkey(full_name), packages(name, price_pkr)")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false });

    if (data) {
      setPendingPayments(data as unknown as PendingPayment[]);
    }
  };

  const handleApproveProfile = async (profileId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", profileId);

    if (!error) {
      toast({ title: "Profile Approved" });
      fetchProfiles();
    }
  };

  const handleBlockProfile = async (profileId: string, blocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: blocked })
      .eq("id", profileId);

    if (!error) {
      toast({ title: blocked ? "Profile Blocked" : "Profile Unblocked" });
      fetchProfiles();
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    const { error } = await supabase
      .from("user_packages")
      .update({ payment_status: "approved" })
      .eq("id", paymentId);

    if (!error) {
      toast({ title: "Payment Approved" });
      fetchPendingPayments();
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const { error } = await supabase
      .from("user_packages")
      .update({ payment_status: "rejected" })
      .eq("id", paymentId);

    if (!error) {
      toast({ title: "Payment Rejected" });
      fetchPendingPayments();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingProfiles = profiles.filter(p => !p.is_approved && !p.is_blocked);
  const approvedProfiles = profiles.filter(p => p.is_approved && !p.is_blocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Shield className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gradient">Admin Panel</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingProfiles.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{approvedProfiles.length}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payments</p>
                    <p className="text-2xl font-bold text-primary">{pendingPayments.length}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>User Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.gender} • {profile.city || "No city"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile.is_blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : profile.is_approved ? (
                            <Badge className="bg-green-500">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          
                          {!profile.is_approved && !profile.is_blocked && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveProfile(profile.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant={profile.is_blocked ? "outline" : "destructive"}
                            onClick={() => handleBlockProfile(profile.id, !profile.is_blocked)}
                          >
                            {profile.is_blocked ? "Unblock" : <X className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {profiles.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No profiles found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Pending Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {payment.profiles?.full_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.packages?.name} - PKR {payment.packages?.price_pkr?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayment(payment.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPayment(payment.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}

                    {pendingPayments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No pending payments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
