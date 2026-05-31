import { ApiProperty } from "@nestjs/swagger";
import { InviteStatus } from "@prisma/client";

export class InviteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty({ required: false, nullable: true })
  userId!: string | null;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  token!: string;

  @ApiProperty({ enum: InviteStatus })
  status!: InviteStatus;

  @ApiProperty()
  isHost!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
