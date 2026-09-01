import { type Static, t } from "elysia";

export const HomeStatsSchema = t.Object({
  players: t.Number(),
  venues: t.Number(),
  matchesThisMonth: t.Number(),
  hoursPlayed: t.Number(),
  cityCounts: t.Array(t.Object({ city: t.String(), count: t.Number() })),
  recentUsers: t.Array(
    t.Object({ name: t.String(), avatarUrl: t.Nullable(t.String()) }),
  ),
  matchRate: t.Number(),
  newUsersThisMonth: t.Number(),
});

export type HomeStats = Static<typeof HomeStatsSchema>;
