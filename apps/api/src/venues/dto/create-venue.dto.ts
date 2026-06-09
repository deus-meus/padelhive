import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVenueDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  openTime!: string;

  @ApiProperty()
  closeTime!: string;

  @ApiPropertyOptional()
  weeklyHours?: Record<string, { open: string; close: string; closed?: boolean }>;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  photos?: string[];

  @ApiPropertyOptional({ type: [String] })
  facilities?: string[];
}
