import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { User, Save } from "lucide-react";
import { z } from "zod";

// Validation schema matching database constraints
const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(200, "Full name must be less than 200 characters"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  city: z.string().min(1, "City is required").max(100, "City must be less than 100 characters"),
  date_of_birth: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 18 && age <= 100;
  }, "You must be between 18 and 100 years old"),
  education: z.string().max(100).optional(),
  profession: z.string().max(100, "Profession must be less than 100 characters").optional(),
  marital_status: z.string().max(50).optional(),
  phone: z.string().regex(/^(03[0-9]{2}-?[0-9]{7})?$/, "Phone format: 03XX-XXXXXXX").optional().or(z.literal("")),
  whatsapp: z.string().regex(/^(03[0-9]{2}-?[0-9]{7})?$/, "WhatsApp format: 03XX-XXXXXXX").optional().or(z.literal("")),
  bio: z.string().max(2000, "Bio must be less than 2000 characters").optional(),
  requirements: z.string().max(2000, "Requirements must be less than 2000 characters").optional(),
});

const cities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Other"
];

const educationLevels = [
  "Matric", "Intermediate", "Bachelor's", "Master's", "PhD", "Other"
];

const maritalStatuses = [
  "Never Married", "Divorced", "Widowed"
];

const CompleteProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    city: "",
    education: "",
    profession: "",
    marital_status: "",
    phone: "",
    whatsapp: "",
    bio: "",
    requirements: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          gender: data.gender || "",
          date_of_birth: data.date_of_birth || "",
          city: data.city || "",
          education: data.education || "",
          profession: data.profession || "",
          marital_status: data.marital_status || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          bio: data.bio || "",
          requirements: data.requirements || "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validationResult = profileSchema.safeParse(profile);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth || null,
        city: profile.city,
        education: profile.education,
        profession: profile.profession,
        marital_status: profile.marital_status,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        bio: profile.bio,
        requirements: profile.requirements,
      })
      .eq("user_id", session.user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
      navigate("/dashboard");
    }
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
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">Complete Your Profile</CardTitle>
              <p className="text-muted-foreground mt-2">
                Fill in your details to get verified and start matching
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name * <span className="text-xs text-muted-foreground">(max 200 chars)</span></Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Your full name"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) => setProfile({ ...profile, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={profile.city}
                      onValueChange={(value) => setProfile({ ...profile, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Select
                      value={profile.education}
                      onValueChange={(value) => setProfile({ ...profile, education: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession <span className="text-xs text-muted-foreground">(max 100 chars)</span></Label>
                    <Input
                      id="profession"
                      value={profile.profession}
                      onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                      placeholder="e.g., Doctor, Engineer"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select
                      value={profile.marital_status}
                      onValueChange={(value) => setProfile({ ...profile, marital_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      value={profile.whatsapp}
                      onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Yourself <span className="text-xs text-muted-foreground">({profile.bio?.length || 0}/2000)</span></Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself, your interests, family background..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">What You're Looking For <span className="text-xs text-muted-foreground">({profile.requirements?.length || 0}/2000)</span></Label>
                  <Textarea
                    id="requirements"
                    value={profile.requirements}
                    onChange={(e) => setProfile({ ...profile, requirements: e.target.value })}
                    placeholder="Describe your ideal partner, expectations, preferences..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary border-0"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
