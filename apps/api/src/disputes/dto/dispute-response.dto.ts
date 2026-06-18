import { ApiProperty } from "@nestjs/swagger";
import { DisputeStatus, DisputeIssueType, DisputePriority } from "@prisma/client";

export class DisputeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  bookingId!: string | null;

  @ApiProperty({ enum: DisputeIssueType })
  issueType!: DisputeIssueType;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: DisputeStatus })
  status!: DisputeStatus;

  @ApiProperty({ enum: DisputePriority })
  priority!: DisputePriority;

  @ApiProperty({ type: String, nullable: true })
  resolutionNotes!: string | null;

  @ApiProperty({ type: Date, nullable: true })
  resolvedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  user!: { id: string; name: string };

  @ApiProperty()
  venue!: { id: string; name: string };

  @ApiProperty({ nullable: true })
  assignedTo!: { id: string; name: string } | null;
}
