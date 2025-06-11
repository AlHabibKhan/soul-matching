import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentSection from "@/components/PaymentSection";
import ProfileForm from "@/components/ProfileForm";
import Header from "@/components/Header";
import { CheckCircle, CreditCard, User } from "lucide-react";
const Register = () => {
  const [currentStep, setCurrentStep] = useState<'payment' | 'profile' | 'success'>('payment');
  const [registrationId, setRegistrationId] = useState<string>('');
  const handlePaymentSuccess = (transactionId: string) => {
    // Generate registration ID (will be handled by backend)
    const regId = `PK-${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setRegistrationId(regId);
    setCurrentStep('profile');
  };
  const handleProfileSubmit = () => {
    setCurrentStep('success');
  };
  const steps = [{
    id: 'payment',
    title: 'Payment',
    icon: CreditCard,
    completed: currentStep !== 'payment'
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
  return <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => <div key={step.id} className="flex items-center bg-red-400">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.completed ? 'bg-success border-success text-white' : currentStep === step.id ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && <div className={`w-16 h-0.5 mx-4 ${step.completed ? 'bg-success' : 'bg-muted'}`} />}
              </div>)}
          </div>

          {/* Step Content */}
          {currentStep === 'payment' && <PaymentSection onPaymentSuccess={handlePaymentSuccess} />}

          {currentStep === 'profile' && <ProfileForm registrationId={registrationId} onSubmit={handleProfileSubmit} />}

          {currentStep === 'success' && <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient">Registration Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your profile has been successfully created and is under review.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Your Registration ID:</p>
                  <p className="text-lg font-bold text-gradient">{registrationId}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please save your registration ID for future reference. You will be notified once your profile is approved and matches are available.
                </p>
                <Button className="gradient-primary border-0 hover:opacity-90 transition-opacity" onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
};
export default Register;