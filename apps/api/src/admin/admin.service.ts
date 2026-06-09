import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetAdminBookingsDto } from "./dto/get-admin-bookings.dto";
import { BookingStatus, PaymentStatus, Prisma, RefundStatus, VenueStatus } from "@prisma/client";
import { AdminOverviewDto } from "./dto/admin-overview.dto";
import { utcToWibDateStr } from "../common/pricing.util";
import { GetCommissionDto } from "./dto/get-commission.dto";
import { CommissionReportDto, CommissionVenueRowDto } from "./dto/commission-report.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookings(query: GetAdminBookingsDto) {
    const { status, venueId, fromDate, toDate, page = 1, pageSize = 20 } = query;

    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (venueId) {
      where.venueId = venueId;
    }

    if (fromDate || toDate) {
      where.bookingDate = {};
      if (fromDate) {
        where.bookingDate.gte = new Date(`${fromDate}T00:00:00Z`);
      }
      if (toDate) {
        const nextDay = new Date(`${toDate}T00:00:00Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        where.bookingDate.lt = nextDay;
      }
    }

    const rawPage = Number.parseInt(String(page), 10);
    const pageNum = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const rawSize = Number.parseInt(String(pageSize), 10);
    const sizeNumUncapped = Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 20;
    const sizeNum = Math.min(100, sizeNumUncapped);

    const skip = (pageNum - 1) * sizeNum;

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: sizeNum,
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          bookingDate: true,
          startsAt: true,
          endsAt: true,
          durationMinutes: true,
          status: true,
          courtAmount: true,
          platformFee: true,
          voucherDiscount: true,
          finalAmount: true,
          venue: {
            select: { id: true, name: true, city: true },
          },
          court: {
            select: { id: true, name: true, type: true },
          },
          host: {
            select: { id: true, name: true, email: true },
          },
          payment: {
            select: { id: true, amount: true, status: true, provider: true, method: true },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items,
      page: pageNum,
      pageSize: sizeNum,
      total,
    };
  }

  async getOverview(): Promise<AdminOverviewDto> {
    const todayWib = utcToWibDateStr(new Date());
    const monthStart = new Date(`${todayWib.slice(0, 7)}-01T00:00:00.000Z`);
    
    const monthEndExclusive = new Date(monthStart);
    monthEndExclusive.setUTCMonth(monthEndExclusive.getUTCMonth() + 1);

    const [
      monthAggregate,
      totalBookings,
      activeVenues,
      pendingApprovals,
      refundRequests,
      paidCount,
      failedCount
    ] = await Promise.all([
      this.prisma.booking.aggregate({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          bookingDate: { gte: monthStart, lt: monthEndExclusive }
        },
        _sum: { finalAmount: true, platformFee: true },
        _count: { _all: true }
      }),
      this.prisma.booking.count({
        where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.EXPIRED] } }
      }),
      this.prisma.venue.count({ where: { status: VenueStatus.APPROVED } }),
      this.prisma.venue.count({ where: { status: VenueStatus.PENDING } }),
      this.prisma.refund.count({ where: { status: RefundStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    ]);

    const gmv = monthAggregate._sum.finalAmount ?? 0;
    const commissionRevenue = monthAggregate._sum.platformFee ?? 0;
    const monthBookings = monthAggregate._count._all;

    const paymentSuccessRate = (paidCount + failedCount) > 0 
      ? Math.round(paidCount / (paidCount + failedCount) * 100) 
      : 0;
    
    const avgBookingValue = monthBookings > 0 
      ? Math.round(gmv / monthBookings) 
      : 0;

    const avgCommissionRate = gmv > 0 
      ? Math.round((commissionRevenue / gmv) * 1000) / 10 
      : 0;

    return {
      gmv,
      commissionRevenue,
      totalBookings,
      activeVenues,
      pendingApprovals,
      refundRequests,
      paymentSuccessRate,
      avgBookingValue,
      avgCommissionRate,
    };
  }

  async getCommission(query: GetCommissionDto): Promise<CommissionReportDto> {
    const { fromDate, toDate } = query;
    const where: Prisma.BookingWhereInput = {
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    };

    if (fromDate || toDate) {
      where.bookingDate = {};
      if (fromDate) {
        where.bookingDate.gte = new Date(`${fromDate}T00:00:00Z`);
      }
      if (toDate) {
        const nextDay = new Date(`${toDate}T00:00:00Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        where.bookingDate.lt = nextDay;
      }
    }

    const grouped = await this.prisma.booking.groupBy({
      by: ["venueId"],
      where,
      _sum: { platformFee: true, finalAmount: true },
      _count: { _all: true },
    });

    const venueIds = grouped.map((g) => g.venueId);
    const venuesData = await this.prisma.venue.findMany({
      where: { id: { in: venueIds } },
      select: { id: true, name: true, city: true, commissionRate: true },
    });

    const venueMap = new Map(venuesData.map((v) => [v.id, v]));

    const rows: CommissionVenueRowDto[] = grouped.map((g) => {
      const venue = venueMap.get(g.venueId);
      const commission = g._sum.platformFee ?? 0;
      const gmv = g._sum.finalAmount ?? 0;
      
      return {
        venueId: g.venueId,
        venueName: venue?.name ?? "Unknown venue",
        city: venue?.city ?? "—",
        commissionRate: venue?.commissionRate != null ? Number(venue.commissionRate) : 0,
        bookings: g._count._all,
        gmv,
        commission,
        effectiveRate: gmv > 0 ? Math.round((commission / gmv) * 1000) / 10 : 0,
      };
    });

    rows.sort((a, b) => b.commission - a.commission);

    const totalCommission = rows.reduce((sum, r) => sum + r.commission, 0);
    const totalGmv = rows.reduce((sum, r) => sum + r.gmv, 0);
    const totalBookings = rows.reduce((sum, r) => sum + r.bookings, 0);
    const avgCommissionRate = totalGmv > 0 ? Math.round((totalCommission / totalGmv) * 1000) / 10 : 0;

    return {
      totalCommission,
      totalGmv,
      totalBookings,
      avgCommissionRate,
      venues: rows,
    };
  }
}
