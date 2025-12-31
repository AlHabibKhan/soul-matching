
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Simple & Honest Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Register FREE with ID verification — Pay only when you're ready to connect
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <CardHeader className="text-center pb-4">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-2">
                No Payment Required
              </div>
              <CardTitle className="text-2xl font-bold">Free Registration</CardTitle>
              <div className="text-4xl font-bold text-green-600 mb-2">PKR 0</div>
              <p className="text-muted-foreground">Just verify your identity</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Upload CNIC / Driving License / Passport</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Take a live selfie for verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Upload your profile picture</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Create your complete profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Browse all verified profiles FREE</span>
                </div>
              </div>
              <Button className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity">
                Register Free Now
              </Button>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 border-primary/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 gradient-primary"></div>
            <CardHeader className="text-center pb-4">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-2">
                Unlock Contact Details
              </div>
              <CardTitle className="text-2xl font-bold">Premium Access</CardTitle>
              <div className="text-4xl font-bold text-gradient mb-2">PKR 3,000</div>
              <p className="text-muted-foreground">Per year — view unlimited contacts</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>View phone numbers of matches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>See complete contact information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Unlimited profile views for 1 year</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Direct communication with matches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>Pay via JazzCash / Easypaisa</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                Subscribe After Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
