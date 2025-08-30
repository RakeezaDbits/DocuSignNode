import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, CreditCard } from "lucide-react";

interface SquarePaymentProps {
  amount: number; // in cents
  onSuccess: (sourceId: string) => void;
  onError: (error: string) => void;
}

export default function SquarePayment({ amount, onSuccess, onError }: SquarePaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [squareReady, setSquareReady] = useState(false);
  const cardButtonRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeSquare = async () => {
      try {
        // Check if Square Web SDK is loaded
        if (!(window as any).Square) {
          // Load Square Web SDK
          const script = document.createElement('script');
          script.src = 'https://web.squarecdn.com/v1/square.js';
          script.async = true;
          script.onload = () => initSquarePayments();
          script.onerror = () => {
            setIsLoading(false);
            onError('Failed to load payment system');
          };
          document.head.appendChild(script);
        } else {
          initSquarePayments();
        }
      } catch (error) {
        console.error('Square initialization error:', error);
        setIsLoading(false);
        onError('Payment system initialization failed');
      }
    };

    const initSquarePayments = async () => {
      try {
        const Square = (window as any).Square;
        
        if (!Square) {
          throw new Error('Square SDK not loaded');
        }

        // Get application ID from environment
        const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID || process.env.SQUARE_APPLICATION_ID || 'sandbox-sq0idb-example';
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID || process.env.SQUARE_LOCATION_ID || 'main';

        const payments = Square.payments(applicationId, locationId);
        
        const card = await payments.card();
        await card.attach(cardButtonRef.current);
        
        cardRef.current = card;
        setSquareReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Square payments initialization error:', error);
        setIsLoading(false);
        onError('Payment form initialization failed');
      }
    };

    initializeSquare();
  }, [onError]);

  const handlePayment = async () => {
    if (!cardRef.current) {
      onError('Payment form not ready');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await cardRef.current.tokenize();
      
      if (result.status === 'OK') {
        onSuccess(result.token);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
      } else {
        const errorMessage = result.errors?.map((error: any) => error.message).join(', ') || 'Payment failed';
        onError(errorMessage);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError('Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto" data-testid="card-square-payment">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Lock className="text-muted-foreground text-2xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
          <p className="text-2xl font-bold text-primary">
            ${(amount / 100).toFixed(2)}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment form...</p>
          </div>
        ) : squareReady ? (
          <div className="space-y-6">
            <div 
              ref={cardButtonRef} 
              className="min-h-[120px] p-4 border border-input rounded-lg bg-background"
              data-testid="square-card-form"
            />
            
            <Button 
              onClick={handlePayment}
              className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition-colors"
              disabled={isLoading}
              data-testid="button-pay-now"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Pay Now'}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <Lock className="inline h-3 w-3 mr-1" />
              Secured by Square • Your payment information is encrypted
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Payment form failed to load</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              data-testid="button-retry-payment"
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
