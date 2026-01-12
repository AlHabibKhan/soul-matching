import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Upload, Camera, CheckCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IdentityVerificationProps {
  onVerificationComplete: () => void;
}

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const IdentityVerification = ({ onVerificationComplete }: IdentityVerificationProps) => {
  const [idType, setIdType] = useState<string>('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [livePicture, setLivePicture] = useState<File | null>(null);
  const [stillPicture, setStillPicture] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPEG, PNG, or WebP.";
    }
    return null;
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid File",
          description: error,
          variant: "destructive",
        });
        return;
      }
      setter(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, userId: string, prefix: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/${Date.now()}_${prefix}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Failed to upload ${prefix}:`, error);
      return null;
    }

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idType || !idDocument || !livePicture || !stillPicture) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Upload all files
      const [idDocPath, selfiePath, profilePicPath] = await Promise.all([
        uploadFile(idDocument, 'id-documents', user.id, 'id_document'),
        uploadFile(livePicture, 'id-documents', user.id, 'selfie'),
        uploadFile(stillPicture, 'profile-pictures', user.id, 'profile_picture'),
      ]);

      if (!idDocPath || !selfiePath || !profilePicPath) {
        toast({
          title: "Upload Failed",
          description: "Some files failed to upload. Please try again.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Update profile with file URLs
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id_document_url: idDocPath,
          selfie_url: selfiePath,
          profile_picture_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${profilePicPath}`,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        toast({
          title: "Error",
          description: "Failed to save verification documents. Please try again.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      toast({
        title: "Verification Submitted!",
        description: "Your documents are being reviewed.",
      });
      
      onVerificationComplete();
    } catch (err) {
      console.error('Verification error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const isFormValid = idType && idDocument && livePicture && stillPicture;

  return (
    <Card className="max-w-2xl mx-auto bg-card shadow-xl border-border">
      <CardHeader className="text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl text-gradient">Create Your Profile — It's FREE!</CardTitle>
        <p className="text-muted-foreground mt-2">
          Complete identity verification to join our trusted community
        </p>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400 font-medium">✓ No registration fee — 100% FREE to join</p>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Browse profiles free. Pay PKR 3,000/year only when ready to view contact details.
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
                accept="image/jpeg,image/png,image/webp"
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
                    <p className="text-xs mt-1">JPEG, PNG, or WebP (max 5MB)</p>
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
                accept="image/jpeg,image/png,image/webp"
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
                accept="image/jpeg,image/png,image/webp"
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
                    <p className="text-xs mt-1">JPEG, PNG, or WebP (max 5MB)</p>
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
            disabled={!isFormValid || uploading}
            className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Verify & Continue (Free)"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;