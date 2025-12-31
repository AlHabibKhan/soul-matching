
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Upload, Camera, CheckCircle, FileText } from "lucide-react";

interface IdentityVerificationProps {
  onVerificationComplete: () => void;
}

const IdentityVerification = ({ onVerificationComplete }: IdentityVerificationProps) => {
  const [idType, setIdType] = useState<string>('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [livePicture, setLivePicture] = useState<File | null>(null);
  const [stillPicture, setStillPicture] = useState<File | null>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idType && idDocument && livePicture && stillPicture) {
      console.log('Verification documents submitted:', { idType, idDocument, livePicture, stillPicture });
      onVerificationComplete();
    }
  };

  const isFormValid = idType && idDocument && livePicture && stillPicture;

  return (
    <Card className="max-w-2xl mx-auto bg-card shadow-xl border-border">
      <CardHeader className="text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl text-gradient">Free Registration</CardTitle>
        <p className="text-muted-foreground mt-2">
          Verify your identity to create your profile for FREE
        </p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✓ Registration is completely FREE</p>
          <p className="text-sm text-green-600 mt-1">
            Pay only PKR 3,000/year when you want to view contact details of matches
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Document Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Select ID Document Type *
            </Label>
            <Select value={idType} onValueChange={setIdType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cnic">CNIC (National ID Card)</SelectItem>
                <SelectItem value="driving-license">Driving License</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ID Document Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload {idType === 'cnic' ? 'CNIC' : idType === 'driving-license' ? 'Driving License' : idType === 'passport' ? 'Passport' : 'ID Document'} *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange(setIdDocument)}
                className="hidden"
                id="id-document"
              />
              <label htmlFor="id-document" className="cursor-pointer">
                {idDocument ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{idDocument.name}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Click to upload your ID document</p>
                    <p className="text-xs mt-1">Clear photo of front side</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Live Picture */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Live Picture (Selfie) *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange(setLivePicture)}
                className="hidden"
                id="live-picture"
              />
              <label htmlFor="live-picture" className="cursor-pointer">
                {livePicture ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{livePicture.name}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p>Take a live selfie</p>
                    <p className="text-xs mt-1">For identity verification</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Still Picture */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Profile Picture *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange(setStillPicture)}
                className="hidden"
                id="still-picture"
              />
              <label htmlFor="still-picture" className="cursor-pointer">
                {stillPicture ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{stillPicture.name}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Upload a clear photo</p>
                    <p className="text-xs mt-1">This will be shown on your profile</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Why we need verification:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensures genuine profiles only</li>
              <li>Protects you from fake accounts</li>
              <li>Creates a trusted matchmaking environment</li>
              <li>Your documents are securely stored and never shared</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity"
            size="lg"
          >
            Verify & Continue (Free)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;
