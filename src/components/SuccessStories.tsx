
import { Card, CardContent } from "@/components/ui/card";

const stories = [
  {
    names: "Ahmed & Fatima",
    location: "Lahore, Punjab",
    quote: "Found each other through MatchMaker in just 2 months. The location-based matching made it so convenient!",
    registrationIds: "PK-LHR-LHR-PUN-0234 & PK-LHR-LHR-PUN-0567"
  },
  {
    names: "Hassan & Ayesha", 
    location: "Karachi, Sindh",
    quote: "The detailed profile matching helped us find compatibility beyond just location. Truly grateful!",
    registrationIds: "PK-KHI-KHI-SIN-0891 & PK-KHI-KHI-SIN-1024"
  },
  {
    names: "Ali & Zainab",
    location: "Islamabad, ICT", 
    quote: "Professional platform with amazing results. The voluntary donation system shows their genuine intent.",
    registrationIds: "PK-ISB-ISB-ICT-0445 & PK-ISB-ISB-ICT-0778"
  }
];

const SuccessStories = () => {
  return (
    <section id="success-stories" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground">
            Real couples who found their perfect match through our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 animate-fade-up border border-border/50">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {story.names}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {story.location}
                  </p>
                </div>
                
                <blockquote className="text-muted-foreground italic mb-4 leading-relaxed">
                  "{story.quote}"
                </blockquote>
                
                <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                  IDs: {story.registrationIds}
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 gradient-purple"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
