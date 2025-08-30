import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, CreditCard, CheckCircle } from "lucide-react";

interface MockPaymentProps {
  amount: number; // in cents
  onSuccess: (sourceId: string) => void;
  onError: (error: string) => void;
}

export default function MockPayment({
  amount,
  onSuccess,
  onError,
}: MockPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [expiryDate, setExpiryDate] = useState("12/25");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("John Doe");
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      onError("Please fill in all payment fields");
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      // Generate a mock payment token
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setIsProcessing(false);
      
      // Show success toast first
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully.",
      });
      
      // Then call success callback
      onSuccess(mockToken);
    }, 2000);
  };

  return (
    <Card className="max-w-md mx-auto" data-testid="card-mock-payment">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Development Payment</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This is a mock payment for testing
          </p>
          <p className="text-2xl font-bold text-primary">
            ${(amount / 100).toFixed(2)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              data-testid="input-card-name"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="4111 1111 1111 1111"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              maxLength={16}
              data-testid="input-card-number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                maxLength={5}
                data-testid="input-expiry-date"
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                data-testid="input-cvv"
              />
            </div>
          </div>

          <Button
            onClick={handlePayment}
            className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition-colors"
            disabled={isProcessing}
            data-testid="button-pay-now"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing Payment..." : "Pay Now (Test)"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1" />
            Mock Payment for Development • No real charges will be made
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 This is a development payment system. Use any valid-looking card details to test the booking flow.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}