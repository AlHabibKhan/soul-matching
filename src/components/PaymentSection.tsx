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
  return <Card className="max-w-2xl mx-auto bg-white shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-gradient">Registration Payment</CardTitle>
        <p className="text-gray-600">Secure payment via mobile wallet</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Smartphone className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Registration fee: <strong>$5</strong> - One-time payment for profile creation and matching services.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-700">Select Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={value => setPaymentMethod(value as 'jazzcash' | 'easypaisa')}>
            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="jazzcash" id="jazzcash" />
              <Label htmlFor="jazzcash" className="flex items-center space-x-3 cursor-pointer flex-1">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">JazzCash</p>
                  <p className="text-sm text-gray-500">Pay with your JazzCash wallet</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="easypaisa" id="easypaisa" />
              <Label htmlFor="easypaisa" className="flex items-center space-x-3 cursor-pointer flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easypaisa</p>
                  <p className="text-sm text-gray-500">Pay with your Easypaisa wallet</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Mobile Number</Label>
          <Input id="phone" type="tel" placeholder="03XX-XXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="text-center text-lg border-gray-300 focus:border-blue-500 bg-slate-950" />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
          <div className="flex justify-between text-gray-700">
            <span>Registration Fee:</span>
            <span className="font-medium">$5</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Processing Fee:</span>
            <span className="font-medium">PKR 0</span>
          </div>
          <hr className="my-2 border-gray-200" />
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total Amount:</span>
            <span className="text-gradient">$5</span>
          </div>
        </div>

        

        <p className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy. Your payment is secure and encrypted.
        </p>
      </CardContent>
    </Card>;
};
export default PaymentSection;