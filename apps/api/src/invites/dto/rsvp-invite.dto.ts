import { ApiProperty } from "@nestjs/swagger";

export class RsvpInviteDto {
  @ApiProperty({ enum: ["ACCEPTED", "DECLINED"], example: "ACCEPTED" })
  status!: "ACCEPTED" | "DECLINED";
}
