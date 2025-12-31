
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IdentityVerification from "@/components/IdentityVerification";
import ProfileForm from "@/components/ProfileForm";
import Header from "@/components/Header";
import { CheckCircle, Shield, User } from "lucide-react";

const Register = () => {
  const [currentStep, setCurrentStep] = useState<'verification' | 'profile' | 'success'>('verification');
  const [registrationId, setRegistrationId] = useState<string>('');

  const handleVerificationComplete = () => {
    const regId = `PK-${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setRegistrationId(regId);
    setCurrentStep('profile');
  };

  const handleProfileSubmit = () => {
    setCurrentStep('success');
  };

  const steps = [{
    id: 'verification',
    title: 'ID Verification',
    icon: Shield,
    completed: currentStep !== 'verification'
  }, {
    id: 'profile',
    title: 'Profile Creation',
    icon: User,
    completed: currentStep === 'success'
  }, {
    id: 'success',
    title: 'Complete',
    icon: CheckCircle,
    completed: currentStep === 'success'
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'border-primary text-primary bg-primary/10' 
                      : 'border-muted-foreground/30 text-muted-foreground bg-card'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 'verification' && (
            <IdentityVerification onVerificationComplete={handleVerificationComplete} />
          )}

          {currentStep === 'profile' && (
            <ProfileForm registrationId={registrationId} onSubmit={handleProfileSubmit} />
          )}

          {currentStep === 'success' && (
            <Card className="max-w-2xl mx-auto text-center bg-card shadow-lg border-border">
              <CardHeader>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient">Registration Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your profile has been successfully created and is under review.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground">Your Registration ID:</p>
                  <p className="text-lg font-bold text-gradient">{registrationId}</p>
                </div>
                
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20 text-left">
                  <p className="font-semibold text-foreground mb-2">What's Next?</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>✓ Your profile will be verified within 24-48 hours</li>
                    <li>✓ Browse matching profiles for FREE</li>
                    <li>✓ To view contact details of matches, subscribe for <span className="font-bold text-primary">PKR 3,000/year</span></li>
                  </ul>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Please save your registration ID for future reference.
                </p>
                <Button 
                  className="gradient-primary border-0 hover:opacity-90 transition-opacity" 
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
