import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PackagesSection from "@/components/PackagesSection";
import { User, Package, Heart, Settings, LogOut, AlertCircle, CheckCircle, ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: string;
  is_approved: boolean;
  is_verified: boolean;
  city?: string;
  education?: string;
  profession?: string;
}

interface UserPackage {
  id: string;
  proposals_remaining: number;
  payment_status: string;
  expires_at: string;
  packages: {
    name: string;
    proposals_count: number;
  };
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchUserPackage(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchUserPackage = async (userId: string) => {
    const { data } = await supabase
      .from("user_packages")
      .select("*, packages(name, proposals_count)")
      .eq("user_id", userId)
      .eq("payment_status", "approved")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setUserPackage(data as UserPackage);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gradient">
                  Welcome, {profile?.full_name || "User"}!
                </h1>
                {profile?.is_verified ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    ID Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                    <ShieldX className="w-3 h-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Manage your profile and packages
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profile Status */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <User className="w-5 h-5 text-primary mr-2" />
                <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {profile?.is_approved ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Approved</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Pending Approval</span>
                    </>
                  )}
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2 text-primary"
                  onClick={() => navigate("/complete-profile")}
                >
                  Edit Profile →
                </Button>
              </CardContent>
            </Card>

            {/* Active Package */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Package className="w-5 h-5 text-primary mr-2" />
                <CardTitle className="text-sm font-medium">Active Package</CardTitle>
              </CardHeader>
              <CardContent>
                {userPackage ? (
                  <div>
                    <p className="font-bold text-foreground">{userPackage.packages.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {userPackage.proposals_remaining} proposals remaining
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(userPackage.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground">No active package</p>
                    <p className="text-sm text-primary">Purchase below to send proposals</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals Sent */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Heart className="w-5 h-5 text-primary mr-2" />
                <CardTitle className="text-sm font-medium">Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {userPackage?.proposals_remaining || 0}
                </p>
                <p className="text-sm text-muted-foreground">Available to send</p>
              </CardContent>
            </Card>
          </div>

          {/* Packages Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {userPackage ? "Upgrade Your Package" : "Choose a Package"}
            </h2>
            <PackagesSection userId={user?.id || ""} onPurchase={() => fetchUserPackage(user?.id || "")} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/profiles")}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Browse Profiles</h3>
                    <p className="text-sm text-muted-foreground">Find your perfect match</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/complete-profile")}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Edit Profile</h3>
                    <p className="text-sm text-muted-foreground">Update your information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
