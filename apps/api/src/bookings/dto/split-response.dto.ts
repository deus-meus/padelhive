import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BookingSplitShareDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  userId?: string | null;

  @ApiPropertyOptional()
  inviteId?: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: ["PENDING", "PAID"] })
  status!: "PENDING" | "PAID";

  @ApiPropertyOptional()
  paidAt?: Date | null;
}

export class BookingSplitDto {
  @ApiProperty()
  bookingId!: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  splitTotal!: number;

  @ApiProperty()
  paidAmount!: number;

  @ApiProperty()
  shareCount!: number;

  @ApiProperty({ type: [BookingSplitShareDto] })
  shares!: BookingSplitShareDto[];
}
