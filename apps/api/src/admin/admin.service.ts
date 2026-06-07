import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetAdminBookingsDto } from "./dto/get-admin-bookings.dto";
import { Prisma } from "@prisma/client";

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
}
