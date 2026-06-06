import { RefundStatus } from "@prisma/client";

export class RefundResponseDto {
  id!: string;
  bookingId!: string;
  paymentId!: string | null;
  amount!: number;
  reason!: string;
  status!: RefundStatus;
  adminNotes!: string | null;
  processedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
