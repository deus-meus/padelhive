import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ReviewResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() venueId!: string;
  @ApiProperty() bookingId!: string;
  @ApiProperty() rating!: number;
  @ApiPropertyOptional({ nullable: true }) comment!: string | null;
  @ApiProperty() authorId!: string;
  @ApiProperty() authorName!: string;
  @ApiPropertyOptional({ nullable: true }) authorAvatarUrl!: string | null;
  @ApiProperty() createdAt!: string;
}
