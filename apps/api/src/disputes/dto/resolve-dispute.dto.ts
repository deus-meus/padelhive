import { ApiPropertyOptional } from "@nestjs/swagger";

export class ResolveDisputeDto {
  @ApiPropertyOptional()
  resolutionNotes?: string;
}
