import { ApiProperty } from "@nestjs/swagger";

export class CreateInviteDto {
  @ApiProperty({ example: "friend@example.com" })
  email!: string;
}
