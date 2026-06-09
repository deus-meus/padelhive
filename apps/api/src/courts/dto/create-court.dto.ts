import { ApiProperty } from '@nestjs/swagger';
import { CourtType } from '@prisma/client';

export class CreateCourtDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CourtType })
  type!: CourtType;

  @ApiProperty()
  weekdayPeak!: number;

  @ApiProperty()
  weekdayOffPeak!: number;

  @ApiProperty()
  weekendPeak!: number;

  @ApiProperty()
  weekendOffPeak!: number;

  @ApiProperty({ required: false })
  isActive?: boolean;
}
