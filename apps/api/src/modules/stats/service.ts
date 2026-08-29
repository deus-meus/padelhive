import { BookingStatus, UserRole, VenueStatus } from "@prisma/client";
import { utcToWibDateStr } from "../../common/pricing.util";
import {
  prisma as defaultPrisma,
  type PrismaService,
} from "../../common/prisma";

export class StatsService {
  constructor(private readonly prisma: PrismaService = defaultPrisma) {}

  async getHomeStats() {
    const todayWib = utcToWibDateStr(new Date());
    const monthStart = new Date(`${todayWib.slice(0, 7)}-01T00:00:00.000Z`);

    const monthEndExclusive = new Date(monthStart);
    monthEndExclusive.setUTCMonth(monthEndExclusive.getUTCMonth() + 1);

    const wibMonthStartUtc = new Date(
      `${todayWib.slice(0, 7)}-01T00:00:00.000+07:00`,
    );

    const [
      players,
      venues,
      matchesThisMonth,
      hoursSum,
      cityGroups,
      recentUsers,
      completedCount,
      cancelledCount,
      newUsersThisMonth,
    ] = await Promise.all([
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
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true, avatarUrl: true },
      }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      this.prisma.user.count({
        where: { createdAt: { gte: wibMonthStartUtc } },
      }),
    ]);

    const hoursPlayed = Math.round((hoursSum._sum.durationMinutes ?? 0) / 60);

    const matchDenominator = completedCount + cancelledCount;
    const matchRate =
      matchDenominator > 0
        ? Math.round((completedCount / matchDenominator) * 100)
        : 0;

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
      recentUsers: recentUsers.map((u) => ({
        name: u.name,
        avatarUrl: u.avatarUrl,
      })),
      matchRate,
      newUsersThisMonth,
    };
  }
}

export const statsService = new StatsService();
