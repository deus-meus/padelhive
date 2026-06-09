import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVenueDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  openTime?: string;

  @ApiPropertyOptional()
  closeTime?: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  photos?: string[];

  @ApiPropertyOptional({ type: [String] })
  facilities?: string[];
}
