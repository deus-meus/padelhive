import { ApiProperty } from "@nestjs/swagger";
import { VenueStatus } from "@prisma/client";

export class UpdateVenueStatusDto {
  @ApiProperty({ enum: VenueStatus })
  status!: VenueStatus;
}
