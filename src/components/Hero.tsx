import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  is_verified: boolean;
}

const Hero = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, is_verified")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        setProfile(data);
      }
      setLoading(false);
    };

    checkUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderPrimaryButton = () => {
    if (loading) return null;

    // No profile - show registration
    if (!profile) {
      return (
        <Button 
          size="lg" 
          className="gradient-primary border-0 text-lg px-8 py-6 hover:opacity-90 transition-opacity"
          onClick={() => navigate('/register')}
        >
          Start Free Registration
        </Button>
      );
    }

    // Has profile and verified - show browse profiles
    if (profile.is_verified) {
      return (
        <Button 
          size="lg" 
          className="gradient-primary border-0 text-lg px-8 py-6 hover:opacity-90 transition-opacity"
          onClick={() => navigate('/profiles')}
        >
          <Users className="w-5 h-5 mr-2" />
          Browse Proposals
        </Button>
      );
    }

    // Has profile but not verified - show track verification
    return (
      <Button 
        size="lg" 
        className="gradient-primary border-0 text-lg px-8 py-6 hover:opacity-90 transition-opacity"
        onClick={() => navigate('/dashboard')}
      >
        <Search className="w-5 h-5 mr-2" />
        Track Verification Status
      </Button>
    );
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="text-gradient block">Life Partner</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Pakistan's most trusted matrimonial platform. Register FREE with ID verification, 
            browse verified profiles, and connect with your perfect match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {renderPrimaryButton()}
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>
          
          <Card className="max-w-2xl mx-auto p-6 bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>100% Free Registration</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>ID Verified Profiles Only</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>PKR 3,000/Year for Contact Access</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
