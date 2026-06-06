import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MidtransWebhookDto {
  @ApiProperty()
  order_id!: string;

  @ApiProperty()
  status_code!: string;

  @ApiProperty()
  gross_amount!: string;

  @ApiProperty()
  signature_key!: string;

  @ApiProperty()
  transaction_status!: string;

  @ApiPropertyOptional()
  fraud_status?: string;
}
