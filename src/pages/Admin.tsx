import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Users, CreditCard, Check, X, Shield, Eye, Image, RefreshCw } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: string;
  city?: string;
  phone?: string;
  is_approved: boolean;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  profile_picture_url?: string;
}

interface UserPackage {
  id: string;
  user_id: string;
  payment_status: string;
  payment_proof_url?: string;
  created_at: string;
  expires_at: string;
  proposals_remaining: number;
  profiles: { full_name: string; phone?: string } | null;
  packages: { name: string; price_pkr: number } | null;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAdminAccess = useCallback(async () => {
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
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await Promise.all([fetchProfiles(), fetchUserPackages()]);
    setLoading(false);
  }, [navigate, toast]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }

    if (data) {
      setProfiles(data);
    }
  };

  const fetchUserPackages = async () => {
    const { data, error } = await supabase
      .from("user_packages")
      .select("*, profiles!inner(full_name, phone), packages(name, price_pkr)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user packages:", error);
      return;
    }

    if (data) {
      setUserPackages(data as unknown as UserPackage[]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfiles(), fetchUserPackages()]);
    setRefreshing(false);
    toast({ title: "Data refreshed" });
  };

  const handleApproveProfile = async (profileId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", profileId);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to approve profile", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: "Profile approved successfully",
    });
    await fetchProfiles();
  };

  const handleVerifyProfile = async (profileId: string, verified: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: verified })
      .eq("id", profileId);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update verification status", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: verified ? "Profile verified" : "Verification removed",
    });
    await fetchProfiles();
  };

  const handleBlockProfile = async (profileId: string, blocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: blocked })
      .eq("id", profileId);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update block status", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: blocked ? "Profile blocked" : "Profile unblocked",
    });
    await fetchProfiles();
  };

  const handleVerifyPayment = async (packageId: string) => {
    const { error } = await supabase
      .from("user_packages")
      .update({ payment_status: "approved" })
      .eq("id", packageId);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to verify payment", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: "Payment verified successfully",
    });
    await fetchUserPackages();
  };

  const handleRejectPayment = async (packageId: string) => {
    const { error } = await supabase
      .from("user_packages")
      .update({ payment_status: "rejected" })
      .eq("id", packageId);

    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to reject payment", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: "Payment rejected",
    });
    await fetchUserPackages();
  };

  const getPaymentProofUrl = (path: string | undefined) => {
    if (!path) return null;
    const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
    return data?.publicUrl;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
  const pendingPayments = userPackages.filter(p => p.payment_status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-gradient">Admin Panel</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
              <TabsTrigger value="profiles">
                User Profiles ({profiles.length})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Payments ({userPackages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>All User Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Approval Status</TableHead>
                          <TableHead>Verification</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {profile.profile_picture_url && (
                                  <img 
                                    src={profile.profile_picture_url} 
                                    alt={profile.full_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                {profile.full_name}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{profile.gender}</TableCell>
                            <TableCell>{profile.city || "-"}</TableCell>
                            <TableCell>{profile.phone || "-"}</TableCell>
                            <TableCell>
                              {profile.is_blocked ? (
                                <Badge variant="destructive">Blocked</Badge>
                              ) : profile.is_approved ? (
                                <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.is_verified ? (
                                <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>
                              ) : (
                                <Badge variant="outline">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!profile.is_approved && !profile.is_blocked && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveProfile(profile.id)}
                                    title="Approve User"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                )}
                                
                                {!profile.is_verified ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerifyProfile(profile.id, true)}
                                    title="Verify User"
                                  >
                                    <Shield className="w-4 h-4 mr-1" />
                                    Verify
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleVerifyProfile(profile.id, false)}
                                    title="Remove Verification"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant={profile.is_blocked ? "outline" : "destructive"}
                                  onClick={() => handleBlockProfile(profile.id, !profile.is_blocked)}
                                  title={profile.is_blocked ? "Unblock" : "Block"}
                                >
                                  {profile.is_blocked ? "Unblock" : <X className="w-4 h-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

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
                  <CardTitle>All Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Amount (PKR)</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Payment Proof</TableHead>
                          <TableHead>Proposals Left</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userPackages.map((pkg) => (
                          <TableRow key={pkg.id}>
                            <TableCell className="font-medium">
                              {pkg.profiles?.full_name || "Unknown User"}
                            </TableCell>
                            <TableCell>{pkg.packages?.name || "-"}</TableCell>
                            <TableCell>
                              {pkg.packages?.price_pkr?.toLocaleString() || "-"}
                            </TableCell>
                            <TableCell>{getStatusBadge(pkg.payment_status)}</TableCell>
                            <TableCell>
                              {pkg.payment_proof_url ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-1">
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={getPaymentProofUrl(pkg.payment_proof_url) || ''} 
                                          alt="Payment proof"
                                          className="w-10 h-10 object-cover rounded border"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <img 
                                      src={getPaymentProofUrl(pkg.payment_proof_url) || ''} 
                                      alt="Payment proof full"
                                      className="w-full h-auto rounded"
                                    />
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Image className="w-4 h-4" />
                                  No proof
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{pkg.proposals_remaining}</TableCell>
                            <TableCell>
                              {new Date(pkg.expires_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(pkg.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {pkg.payment_status === "pending" && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyPayment(pkg.id)}
                                    title="Verify Payment"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectPayment(pkg.id)}
                                    title="Reject Payment"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {pkg.payment_status !== "pending" && (
                                <span className="text-muted-foreground text-sm">
                                  {pkg.payment_status === "approved" ? "Processed" : "Rejected"}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {userPackages.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No payments found
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
