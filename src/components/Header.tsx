import { useState, useEffect, useCallback } from "react";
import { Users, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAdminRole = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
        return;
      }
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        fetchPendingCount();
      }
    } catch (err) {
      console.error("Admin check failed:", err);
      setIsAdmin(false);
    }
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false)
        .eq("is_blocked", false);
      
      setPendingCount(count ?? 0);
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Delay check to avoid race conditions
        setTimeout(() => checkAdminRole(), 100);
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
  }, [checkAdminRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const NavLinks = () => (
    <>
      <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
        How It Works
      </a>
      <a href="/#success-stories" className="text-muted-foreground hover:text-foreground transition-colors">
        Success Stories
      </a>
      <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
        Pricing
      </a>
    </>
  );

  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {user ? (
        <>
          {isAdmin && (
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"}
              onClick={() => handleNavigate('/admin')}
              className={`relative ${isMobile ? 'w-full justify-start' : ''}`}
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin Panel
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-[10px] text-destructive-foreground font-bold">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => handleNavigate('/dashboard')}
            className={isMobile ? 'w-full justify-start' : ''}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            size={isMobile ? "default" : "icon"}
            onClick={handleLogout}
            className={isMobile ? 'w-full justify-start' : ''}
          >
            <LogOut className="w-4 h-4" />
            {isMobile && <span className="ml-2">Sign Out</span>}
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="outline" 
            onClick={() => handleNavigate('/auth')}
            className={isMobile ? 'w-full' : ''}
          >
            Sign In
          </Button>
          <Button 
            className={`gradient-primary border-0 hover:opacity-90 transition-opacity text-white ${isMobile ? 'w-full' : ''}`}
            onClick={() => handleNavigate('/auth')}
          >
            Get Started
          </Button>
        </>
      )}
    </>
  );

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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <AuthButtons />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-6 mt-8">
                <div className="flex flex-col space-y-4">
                  <NavLinks />
                </div>
                <div className="border-t pt-4 flex flex-col space-y-3">
                  <AuthButtons isMobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
};

export default Header;
