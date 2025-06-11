
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="text-gradient block">Life Partner</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A trusted digital matchmaking platform connecting hearts across Pakistan. 
            Join thousands who found their soulmate through our secure, location-based matching system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gradient-primary border-0 text-lg px-8 py-6 hover:opacity-90 transition-opacity">
              Start Your Journey - PKR 500
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
          
          <Card className="max-w-2xl mx-auto p-6 bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Location-Based Matching</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Success-Based Donations</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
