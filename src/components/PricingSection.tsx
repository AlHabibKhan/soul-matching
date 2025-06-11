
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Pay only what's fair - registration fee upfront, donation after success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Registration</CardTitle>
              <div className="text-4xl font-bold text-gradient mb-2">PKR 500</div>
              <p className="text-muted-foreground">One-time registration fee</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Complete profile creation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Unique registration ID</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Location-based matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Profile verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Admin-reviewed matches</span>
                </div>
              </div>
              <Button className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity">
                Register Now via JazzCash/Easypaisa
              </Button>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 border-gold/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 gradient-primary"></div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Success Donation</CardTitle>
              <div className="text-4xl font-bold text-gradient mb-2">PKR 1000+</div>
              <p className="text-muted-foreground">Voluntary donation per person</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Pay only after successful match</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Voluntary contribution</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Supports platform growth</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Helps other couples find love</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Completion certificate</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-white transition-colors">
                Learn More About Success Donations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
