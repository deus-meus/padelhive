import { Elysia } from "elysia";
import { statsService } from "./service";
import { HomeStatsSchema } from "./model";

export const statsModule = new Elysia({ prefix: "/stats", name: "statsModule" })
  .get("/home", () => {
    return statsService.getHomeStats();
  }, {
    response: HomeStatsSchema,
    detail: { summary: "Live platform homepage statistics", tags: ["Stats"] },
  });
