import { ApiProperty } from "@nestjs/swagger";

export class SetBookingSplitDto {
  @ApiProperty({ enum: ["equal", "custom"] })
  mode!: "equal" | "custom";

  @ApiProperty({
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", nullable: true },
        userId: { type: "string", nullable: true },
        inviteId: { type: "string", nullable: true },
        amount: { type: "number", nullable: true },
      },
    },
  })
  participants!: {
    name: string;
    email?: string;
    userId?: string;
    inviteId?: string;
    amount?: number;
  }[];
}
