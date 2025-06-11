
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Register & Pay",
    description: "Create your profile with a one-time registration fee of PKR 500 via JazzCash/Easypaisa. Get your unique registration ID.",
    color: "from-primary to-gold"
  },
  {
    step: "02", 
    title: "Complete Profile",
    description: "Fill detailed profile form with personal information, preferences, and partner requirements. All data is kept confidential.",
    color: "from-purple to-accent"
  },
  {
    step: "03",
    title: "Get Matched",
    description: "Our algorithm suggests compatible profiles based on location (Tehsil → District → Province) and your preferences.",
    color: "from-accent to-purple"
  },
  {
    step: "04",
    title: "Connect & Succeed",
    description: "Connect with matches through our secure platform. Upon successful marriage, both parties contribute a voluntary donation.",
    color: "from-success to-primary"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple, secure, and effective process to find your life partner
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 animate-fade-up border border-border/50">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <CardTitle className="text-xl font-semibold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`}></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
