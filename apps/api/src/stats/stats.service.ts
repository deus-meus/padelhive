import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HomeStatsDto } from "./dto/home-stats.dto";
import { BookingStatus, UserRole, VenueStatus } from "@prisma/client";
import { utcToWibDateStr } from "../common/pricing.util";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeStats(): Promise<HomeStatsDto> {
    const todayWib = utcToWibDateStr(new Date());
    const monthStart = new Date(`${todayWib.slice(0, 7)}-01T00:00:00.000Z`);
    
    const monthEndExclusive = new Date(monthStart);
    monthEndExclusive.setUTCMonth(monthEndExclusive.getUTCMonth() + 1);

    const [players, venues, matchesThisMonth, hoursSum, cityGroups] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PLAYER } }),
      this.prisma.venue.count({ where: { status: VenueStatus.APPROVED } }),
      this.prisma.booking.count({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          bookingDate: { gte: monthStart, lt: monthEndExclusive },
        },
      }),
      this.prisma.booking.aggregate({
        _sum: { durationMinutes: true },
        where: { status: BookingStatus.COMPLETED },
      }),
      this.prisma.venue.groupBy({
        by: ["city"],
        where: { status: VenueStatus.APPROVED },
        _count: { _all: true },
      }),
    ]);

    const hoursPlayed = Math.round((hoursSum._sum.durationMinutes ?? 0) / 60);

    const cityCounts = cityGroups.map((group) => ({
      city: group.city,
      count: group._count._all,
    }));

    return {
      players,
      venues,
      matchesThisMonth,
      hoursPlayed,
      cityCounts,
    };
  }
}
