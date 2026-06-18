import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DisputeIssueType, DisputePriority } from "@prisma/client";

export class CreateDisputeDto {
  @ApiProperty()
  bookingId!: string;

  @ApiProperty({ enum: DisputeIssueType })
  issueType!: DisputeIssueType;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({ enum: DisputePriority })
  priority?: DisputePriority;
}
