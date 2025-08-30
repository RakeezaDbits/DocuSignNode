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

export default function SquarePayment({
  amount,
  onSuccess,
  onError,
}: SquarePaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [squareReady, setSquareReady] = useState(false);
  const cardButtonRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const { toast } = useToast();

  // Placeholder for payment object and card object to satisfy the type checker for now
  // These will be populated by the Square SDK
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get application ID and location ID from environment variables
  const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
  const environment = import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';

  // Load Square Web SDK
  useEffect(() => {
    // Check if SDK is already loaded
    if (window.Square) {
      console.log("Square Web SDK already loaded");
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="square.js"]');
    if (existingScript) {
      console.log("Square Web SDK script already exists");
      return;
    }

    const script = document.createElement("script");
    script.src = environment === 'production' 
      ? "https://web.squarecdn.com/v1/square.js"
      : "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;
    script.onload = () => {
      console.log("Square Web SDK loaded successfully");
    };
    script.onerror = (error) => {
      console.error("Failed to load Square Web SDK:", error);
      onError(
        "Failed to load payment system. Please check your internet connection.",
      );
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[src*="square.js"]');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [onError]);

  useEffect(() => {
    async function initializeSquare() {
      try {
        // Wait for Square SDK to load
        if (!window.Square) {
          console.error("Square Web SDK not loaded");
          onError("Square Web SDK not loaded");
          return;
        }

        if (!applicationId || !locationId) {
          console.error("Square credentials not configured");
          onError("Payment system not configured. Please contact support.");
          return;
        }

        // Initialize payments with proper error handling
        const payments = window.Square.payments(applicationId, locationId);
        setPayments(payments);

        // Create and attach card with better error handling
        const card = await payments.card({
          style: {
            ".input-container": {
              borderColor: "#d1d5db",
              borderRadius: "6px",
            },
            ".input-container.is-focus": {
              borderColor: "#3b82f6",
            },
            ".input-container.is-error": {
              borderColor: "#ef4444",
            },
          },
        });

        await card.attach(cardButtonRef.current);
        setCard(card);

        console.log("Square payment form initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Square payments:", error);
        onError(
          `Payment form initialization failed: ${error.message || "Unknown error"}`,
        );
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeSquare, 100);
    return () => clearTimeout(timer);
  }, [applicationId, locationId, onError]);

  const handlePayment = async () => {
    if (!card || !payments) {
      onError(
        "Payment system not ready. Please refresh the page and try again.",
      );
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Starting payment tokenization...");
      const result = await card.tokenize();

      if (result.status === "OK" && result.token) {
        console.log("Tokenization successful");

        // Send token to backend
        const response = await fetch("/api/payment/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: amount,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Payment processed successfully");
          onSuccess(result.token);
        } else {
          const errorData = await response.json();
          console.error("Payment processing failed:", errorData);
          onError(errorData.message || "Payment processing failed on server");
        }
      } else {
        console.error("Tokenization failed:", result.errors);
        const errorMessage =
          result.errors && result.errors.length > 0
            ? result.errors[0].detail
            : "Invalid payment information";
        onError(errorMessage);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      onError(`Payment processing failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
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
              id="card-container"
              className="min-h-[120px] p-4 border border-input rounded-lg bg-background"
              data-testid="square-card-form"
            />

            <Button
              onClick={handlePayment}
              className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition-colors"
              disabled={isLoading || isProcessing}
              data-testid="button-pay-now"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <Lock className="inline h-3 w-3 mr-1" />
              Secured by Square • Your payment information is encrypted
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Payment form failed to load
            </p>
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
