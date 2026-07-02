import { ApiProperty } from "@nestjs/swagger";

class CityCountDto {
  @ApiProperty()
  city!: string;

  @ApiProperty()
  count!: number;
}

export class HomeStatsDto {
  @ApiProperty()
  players!: number;

  @ApiProperty()
  venues!: number;

  @ApiProperty()
  matchesThisMonth!: number;

  @ApiProperty()
  hoursPlayed!: number;

  @ApiProperty({ type: [CityCountDto] })
  cityCounts!: CityCountDto[];
}
