
import { useState, useEffect } from "react";
import { Users, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAdminRole(), 0);
      } else {
        setIsAdmin(false);
        setPendingCount(0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async () => {
    // Use server-side RPC function for consistent admin verification
    const { data } = await supabase.rpc('is_admin');
    const adminStatus = !!data;
    setIsAdmin(adminStatus);
    
    // If admin, fetch pending profiles count
    if (adminStatus) {
      fetchPendingCount();
    }
  };

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false)
      .eq("is_blocked", false);
    
    setPendingCount(count ?? 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">MatchMaker</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="/#success-stories" className="text-muted-foreground hover:text-foreground transition-colors">
              Success Stories
            </a>
            <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden sm:inline-flex relative"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-destructive-foreground font-bold">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:inline-flex"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="hidden sm:inline-flex"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  className="gradient-primary border-0 hover:opacity-90 transition-opacity text-white" 
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
