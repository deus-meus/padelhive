import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VenueStatus } from "@prisma/client";

export class VenueResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ type: [String] })
  photos!: string[];

  @ApiProperty({ type: [String] })
  facilities!: string[];

  @ApiProperty()
  openTime!: string;

  @ApiProperty()
  closeTime!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  reviewCount!: number;

  @ApiProperty({ enum: VenueStatus })
  status!: VenueStatus;
}
