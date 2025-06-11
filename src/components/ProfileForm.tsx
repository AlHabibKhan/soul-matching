
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin } from "lucide-react";

interface ProfileFormProps {
  registrationId: string;
  onSubmit: () => void;
}

const ProfileForm = ({ registrationId, onSubmit }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    religion: '',
    caste: '',
    education: '',
    occupation: '',
    tehsil: '',
    district: '',
    province: '',
    country: 'Pakistan',
    maritalStatus: '',
    partnerAgeMin: '',
    partnerAgeMax: '',
    partnerEducation: '',
    partnerOccupation: '',
    partnerLocation: '',
    additionalInfo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation would be added here
    console.log('Profile data:', formData);
    onSubmit();
  };

  const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir'];
  const educationLevels = ['Matric', 'Intermediate', 'Bachelor', 'Master', 'PhD', 'Other'];
  const religions = ['Islam', 'Christianity', 'Hinduism', 'Other'];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-gradient">Create Your Profile</CardTitle>
        <p className="text-muted-foreground">Registration ID: <span className="font-medium">{registrationId}</span></p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="60"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                <Label htmlFor="maritalStatus">Marital Status *</Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never-married">Never Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Religion *</Label>
                <Select value={formData.religion} onValueChange={(value) => handleInputChange('religion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map(religion => (
                      <SelectItem key={religion} value={religion.toLowerCase()}>{religion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caste">Caste/Community</Label>
                <Input
                  id="caste"
                  value={formData.caste}
                  onChange={(e) => handleInputChange('caste', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education *</Label>
                <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map(level => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province.toLowerCase()}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tehsil">Tehsil *</Label>
                <Input
                  id="tehsil"
                  value={formData.tehsil}
                  onChange={(e) => handleInputChange('tehsil', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Partner Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Partner Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerAgeMin">Preferred Age Range</Label>
                <div className="flex gap-2">
                  <Input
                    id="partnerAgeMin"
                    type="number"
                    placeholder="Min age"
                    value={formData.partnerAgeMin}
                    onChange={(e) => handleInputChange('partnerAgeMin', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max age"
                    value={formData.partnerAgeMax}
                    onChange={(e) => handleInputChange('partnerAgeMax', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerEducation">Preferred Education</Label>
                <Select value={formData.partnerEducation} onValueChange={(value) => handleInputChange('partnerEducation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {educationLevels.map(level => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerOccupation">Preferred Occupation</Label>
                <Input
                  id="partnerOccupation"
                  value={formData.partnerOccupation}
                  onChange={(e) => handleInputChange('partnerOccupation', e.target.value)}
                  placeholder="Any specific preference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerLocation">Preferred Location</Label>
                <Input
                  id="partnerLocation"
                  value={formData.partnerLocation}
                  onChange={(e) => handleInputChange('partnerLocation', e.target.value)}
                  placeholder="e.g., Same city, Any in province"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Tell us more about yourself and what you're looking for</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Family background, interests, expectations..."
                rows={4}
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity"
            size="lg"
          >
            Submit Profile for Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
