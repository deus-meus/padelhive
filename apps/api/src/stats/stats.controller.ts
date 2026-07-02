import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { StatsService } from "./stats.service";
import { HomeStatsDto } from "./dto/home-stats.dto";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("stats")
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("home")
  @Public()
  @ApiOperation({ summary: "Get live statistics for the home page" })
  @ApiOkResponse({ type: HomeStatsDto })
  async getHomeStats(): Promise<HomeStatsDto> {
    return this.statsService.getHomeStats();
  }
}
