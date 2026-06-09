import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetCommissionDto {
  @ApiPropertyOptional({ description: "Format: YYYY-MM-DD" })
  fromDate?: string;

  @ApiPropertyOptional({ description: "Format: YYYY-MM-DD" })
  toDate?: string;
}
