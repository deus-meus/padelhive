import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourtType } from '@prisma/client';

export class UpdateCourtDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: CourtType })
  type?: CourtType;

  @ApiPropertyOptional()
  weekdayPeak?: number;

  @ApiPropertyOptional()
  weekdayOffPeak?: number;

  @ApiPropertyOptional()
  weekendPeak?: number;

  @ApiPropertyOptional()
  weekendOffPeak?: number;

  @ApiPropertyOptional()
  isActive?: boolean;
}
