import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Upload, CreditCard, Clock } from "lucide-react";

interface Package {
  id: string;
  name: string;
  price_pkr: number;
  proposals_count: number;
  validity_days: number;
}

interface PackagesSectionProps {
  userId: string;
  onPurchase: () => void;
}

const PackagesSection = ({ userId, onPurchase }: PackagesSectionProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price_pkr", { ascending: true });

    if (data) {
      setPackages(data);
    }
  };

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedPackage || !userId) return;

    setUploading(true);

    let paymentProofUrl = null;

    // If payment proof file is provided, we would upload it to storage
    // For now, we just note that payment proof was provided
    if (paymentProof) {
      paymentProofUrl = `payment_proof_${userId}_${Date.now()}.${paymentProof.name.split('.').pop()}`;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + selectedPackage.validity_days);

    const { error } = await supabase.from("user_packages").insert({
      user_id: userId,
      package_id: selectedPackage.id,
      proposals_remaining: selectedPackage.proposals_count,
      payment_proof_url: paymentProofUrl,
      payment_status: "pending",
      expires_at: expiresAt.toISOString(),
    });

    setUploading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Submitted!",
        description: "Your payment is under review. You'll be notified once approved.",
      });
      setShowPaymentDialog(false);
      setSelectedPackage(null);
      setPaymentProof(null);
      onPurchase();
    }
  };

  const features = [
    "Send profile proposals",
    "View contact details on acceptance",
    "Valid for 1 year",
    "Priority support",
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <Card 
            key={pkg.id} 
            className={`bg-card border-border relative overflow-hidden transition-all hover:shadow-lg ${
              index === 1 ? "border-primary ring-2 ring-primary/20" : ""
            }`}
          >
            {index === 1 && (
              <div className="absolute top-0 right-0 gradient-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold text-foreground">{pkg.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gradient">PKR {pkg.price_pkr.toLocaleString()}</span>
                <p className="text-sm text-muted-foreground mt-1">per year</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 bg-primary/5 rounded-lg">
                <span className="text-3xl font-bold text-primary">{pkg.proposals_count}</span>
                <p className="text-sm text-muted-foreground">Profile Proposals</p>
              </div>
              
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${index === 1 ? "gradient-primary border-0" : ""}`}
                variant={index === 1 ? "default" : "outline"}
                onClick={() => handleSelectPackage(pkg)}
              >
                Select Package
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient">Complete Payment</DialogTitle>
            <DialogDescription>
              Transfer the amount to our bank account and upload proof
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium text-foreground">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-primary">PKR {selectedPackage.price_pkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposals:</span>
                  <span className="font-medium text-foreground">{selectedPackage.proposals_count}</span>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Bank Account Details
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Bank:</strong> HBL (Habib Bank Limited)</p>
                  <p><strong>Account Title:</strong> Matrimonial Services</p>
                  <p><strong>Account Number:</strong> 1234-5678-9012-3456</p>
                  <p><strong>IBAN:</strong> PK00HABB1234567890123456</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-proof">Upload Payment Proof</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="payment-proof" className="cursor-pointer">
                    {paymentProof ? (
                      <div className="flex items-center justify-center text-primary">
                        <Check className="w-5 h-5 mr-2" />
                        {paymentProof.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Upload className="w-8 h-8 mb-2" />
                        <span>Click to upload receipt</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Payment verification takes 24-48 hours
              </div>

              <Button
                className="w-full gradient-primary border-0"
                onClick={handleSubmitPayment}
                disabled={uploading}
              >
                {uploading ? "Submitting..." : "Submit Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PackagesSection;
