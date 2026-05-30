import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BookingResponseDto } from "./dto/booking-response.dto";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBookingForUser(id: string, hostUserId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, hostUserId },
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
        venue: { select: { id: true, name: true, city: true } },
        court: { select: { id: true, name: true, type: true } },
        host: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }
}
