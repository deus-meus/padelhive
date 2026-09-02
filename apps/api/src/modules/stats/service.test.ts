import { describe, expect, it, mock } from "bun:test";
import { StatsService } from "./service";

describe("StatsService", () => {
  it("getHomeStats calculates marketplace statistics correctly", async () => {
    const mockPrisma = {
      user: {
        count: mock()
          .mockResolvedValueOnce(150) // players
          .mockResolvedValueOnce(12), // newUsersThisMonth
        findMany: mock().mockResolvedValue([
          { name: "User A", avatarUrl: "http://example.com/a.png" },
        ]),
      },
      venue: {
        count: mock().mockResolvedValue(10), // approved venues
        groupBy: mock().mockResolvedValue([
          { city: "Jakarta", _count: { _all: 7 } },
          { city: "Bali", _count: { _all: 3 } },
        ]),
      },
      booking: {
        count: mock()
          .mockResolvedValueOnce(45) // matchesThisMonth
          .mockResolvedValueOnce(80) // completedCount
          .mockResolvedValueOnce(20), // cancelledCount
        aggregate: mock().mockResolvedValue({
          _sum: { durationMinutes: 7200 }, // 120 hours
        }),
      },
    };

    const service = new StatsService(mockPrisma as never);
    const stats = await service.getHomeStats();

    expect(stats.players).toBe(150);
    expect(stats.venues).toBe(10);
    expect(stats.matchesThisMonth).toBe(45);
    expect(stats.hoursPlayed).toBe(120); // 7200 / 60
    expect(stats.matchRate).toBe(80); // 80 / (80 + 20) * 100
    expect(stats.newUsersThisMonth).toBe(12);
    expect(stats.cityCounts).toEqual([
      { city: "Jakarta", count: 7 },
      { city: "Bali", count: 3 },
    ]);
    expect(stats.recentUsers).toEqual([
      { name: "User A", avatarUrl: "http://example.com/a.png" },
    ]);
  });
});
