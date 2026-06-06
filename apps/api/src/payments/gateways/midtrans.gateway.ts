import { BadGatewayException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateTransactionParams, CreateTransactionResult, PaymentGateway } from "./payment-gateway.interface";

@Injectable()
export class MidtransGateway implements PaymentGateway {
  async createTransaction(params: CreateTransactionParams): Promise<CreateTransactionResult> {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    const baseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1"
      : "https://app.sandbox.midtrans.com/snap/v1";

    const authString = Buffer.from(`${serverKey}:`).toString("base64");

    const payload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
    };

    const response = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(`Midtrans transaction failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
      providerReference: params.orderId,
      redirectUrl: data.redirect_url,
      token: data.token,
    };
  }

  async refundPayment(orderId: string, amount: number, refundKey: string): Promise<void> {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    const baseUrl = isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";

    const authString = Buffer.from(`${serverKey}:`).toString("base64");

    const payload = {
      refund_key: refundKey,
      amount: amount,
    };

    const response = await fetch(`${baseUrl}/${orderId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(`Midtrans refund failed: ${response.status} ${errorText}`);
    }
  }
}
