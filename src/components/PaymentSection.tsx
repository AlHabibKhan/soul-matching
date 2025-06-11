import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Smartphone } from "lucide-react";
interface PaymentSectionProps {
  onPaymentSuccess: (transactionId: string) => void;
}
const PaymentSection = ({
  onPaymentSuccess
}: PaymentSectionProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = async () => {
    if (!phoneNumber) return;
    setIsProcessing(true);

    // Simulate payment processing (replace with actual payment gateway integration)
    setTimeout(() => {
      const mockTransactionId = `TXN${Date.now()}`;
      setIsProcessing(false);
      onPaymentSuccess(mockTransactionId);
    }, 3000);
  };
  return <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-gradient">Registration Payment</CardTitle>
        <p className="text-muted-foreground">Secure payment via mobile wallet</p>
      </CardHeader>
      <CardContent className="space-y-6 bg-orange-800 rounded">
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Registration fee: <strong>$5</strong> - One-time payment for profile creation and matching services.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={value => setPaymentMethod(value as 'jazzcash' | 'easypaisa')}>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="jazzcash" id="jazzcash" />
              <Label htmlFor="jazzcash" className="flex items-center space-x-3 cursor-pointer flex-1">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">JazzCash</p>
                  <p className="text-sm text-muted-foreground">Pay with your JazzCash wallet</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="easypaisa" id="easypaisa" />
              <Label htmlFor="easypaisa" className="flex items-center space-x-3 cursor-pointer flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Easypaisa</p>
                  <p className="text-sm text-muted-foreground">Pay with your Easypaisa wallet</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input id="phone" type="tel" placeholder="03XX-XXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="text-center text-lg bg-green-500 rounded-sm" />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Registration Fee:</span>
            <span className="font-medium">$5</span>
          </div>
          <div className="flex justify-between">
            <span>Processing Fee:</span>
            <span className="font-medium">PKR 0</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-gradient">$5</span>
          </div>
        </div>

        <Button onClick={handlePayment} disabled={!phoneNumber || isProcessing} size="lg" className="w-full gradient-primary border-0 hover:opacity-90 transition-opacity font-normal text-slate-50">
          {isProcessing ? 'Processing Payment...' : `Pay PKR 500 via ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy. Your payment is secure and encrypted.
        </p>
      </CardContent>
    </Card>;
};
export default PaymentSection;