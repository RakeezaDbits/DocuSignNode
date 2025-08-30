import { SquareClient, SquareEnvironment } from 'square';

interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  sourceId: string; // from Square payment form
  appointmentId: string;
}

interface PaymentResult {
  paymentId: string;
  status: string;
  amount: number;
}

class SquareService {
  private client: SquareClient;

  constructor() {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT === 'production' 
      ? SquareEnvironment.Production 
      : SquareEnvironment.Sandbox;

    if (!accessToken) {
      throw new Error('Square access token not configured');
    }

    this.client = new SquareClient({
      accessToken: accessToken,
      environment,
    });

    console.log(`Square client initialized for ${environment} environment`);
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentsApi = this.client.payments;

      const requestBody = {
        sourceId: request.sourceId,
        amountMoney: {
          amount: BigInt(request.amount),
          currency: request.currency,
        },
        idempotencyKey: `${request.appointmentId}-${Date.now()}`,
        note: `GuardPortal Security Audit - Appointment ${request.appointmentId}`,
        referenceId: request.appointmentId,
      };

      const response = await paymentsApi.createPayment(requestBody);

      if (response.result.payment) {
        const payment = response.result.payment;
        return {
          paymentId: payment.id || '',
          status: payment.status || 'UNKNOWN',
          amount: Number(payment.amountMoney?.amount || 0),
        };
      } else {
        throw new Error('Payment creation failed');
      }
    } catch (error) {
      console.error('Square payment error:', error);
      throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundsApi = this.client.refunds;

      const requestBody = {
        paymentId,
        amountMoney: amount ? {
          amount: BigInt(amount),
          currency: 'USD',
        } : undefined,
        idempotencyKey: `refund-${paymentId}-${Date.now()}`,
        reason: 'Appointment cancellation',
      };

      const response = await refundsApi.refundPayment(requestBody);
      return response.result;
    } catch (error) {
      console.error('Square refund error:', error);
      throw new Error(`Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getWebhookSignatureKey(): string {
    return process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';
  }
}

export const squareService = new SquareService();
