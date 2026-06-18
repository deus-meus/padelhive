import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({ example: "booking-completed", description: "ID of the COMPLETED booking being reviewed" })
  bookingId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: "Rating from 1 to 5" })
  rating!: number;

  @ApiPropertyOptional({ example: "Great court, friendly staff!", description: "Optional written review" })
  comment?: string;
}
