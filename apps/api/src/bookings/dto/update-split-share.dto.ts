import { ApiProperty } from "@nestjs/swagger";

export class UpdateSplitShareStatusDto {
  @ApiProperty({ enum: ["PENDING", "PAID"] })
  status!: "PENDING" | "PAID";
}
