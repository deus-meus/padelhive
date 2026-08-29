import { Elysia } from "elysia";
import { HomeStatsSchema } from "./model";
import { statsService } from "./service";

export const statsModule = new Elysia({
  prefix: "/stats",
  name: "statsModule",
}).get(
  "/home",
  () => {
    return statsService.getHomeStats();
  },
  {
    response: HomeStatsSchema,
    detail: { summary: "Live platform homepage statistics", tags: ["Stats"] },
  },
);
