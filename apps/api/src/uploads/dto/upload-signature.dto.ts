import { ApiProperty } from "@nestjs/swagger";

export class UploadSignatureDto {
  @ApiProperty()
  timestamp!: number;

  @ApiProperty()
  signature!: string;

  @ApiProperty()
  apiKey!: string;

  @ApiProperty()
  cloudName!: string;

  @ApiProperty()
  folder!: string;
}
