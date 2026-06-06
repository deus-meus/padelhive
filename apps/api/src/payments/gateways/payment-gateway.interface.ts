export const PAYMENT_GATEWAY_TOKEN = Symbol("PAYMENT_GATEWAY_TOKEN");

export interface CreateTransactionParams {
  orderId: string;
  amount: number;
  method: string;
}

export interface CreateTransactionResult {
  providerReference: string;
  redirectUrl?: string;
  token?: string;
}

export interface PaymentGateway {
  createTransaction(params: CreateTransactionParams): Promise<CreateTransactionResult>;
  refundPayment(orderId: string, amount: number, refundKey: string): Promise<void>;
}
