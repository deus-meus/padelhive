import { RefundStatus } from "@prisma/client";

export class RefundEventResponseDto {
  id!: string;
  refundId!: string;
  fromStatus!: RefundStatus | null;
  toStatus!: RefundStatus;
  actorUserId!: string;
  notes!: string | null;
  createdAt!: Date;
}
