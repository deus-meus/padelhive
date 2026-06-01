import { randomBytes } from "crypto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, InviteStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInviteDto } from "./dto/create-invite.dto";
import { InviteResponseDto } from "./dto/invite-response.dto";
import { RsvpInviteDto } from "./dto/rsvp-invite.dto";

const inviteSelect = {
  id: true,
  bookingId: true,
  userId: true,
  email: true,
  name: true,
  token: true,
  status: true,
  isHost: true,
  createdAt: true,
  updatedAt: true,
};

const inviteDetailsSelect = {
  ...inviteSelect,
  booking: {
    select: {
      id: true,
      bookingDate: true,
      startsAt: true,
      endsAt: true,
      status: true,
      venue: { select: { id: true, name: true, city: true } },
      court: { select: { id: true, name: true, type: true } },
      host: { select: { id: true, name: true, email: true } },
    },
  },
};

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInviteForBooking(userId: string, bookingId: string, body: CreateInviteDto): Promise<InviteResponseDto> {
    const booking = await this.findOwnedInvitableBooking(userId, bookingId);
    const email = this.normalizeEmail(body.email);
    const existing = await this.prisma.invite.findUnique({
      where: { bookingId_email: { bookingId: booking.id, email } },
      select: inviteSelect,
    });
    if (existing) return existing;

    return this.prisma.invite.create({
      data: {
        bookingId: booking.id,
        email,
        name: this.deriveName(email),
        token: await this.generateUniqueToken(),
        status: InviteStatus.PENDING,
        isHost: false,
      },
      select: inviteSelect,
    });
  }

  async listInvitesForBooking(userId: string, bookingId: string): Promise<InviteResponseDto[]> {
    const booking = await this.findOwnedBooking(userId, bookingId);
    return this.prisma.invite.findMany({
      where: { bookingId: booking.id },
      select: inviteSelect,
      orderBy: { createdAt: "asc" },
    });
  }

  async getInviteByToken(token: string): Promise<InviteResponseDto> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      select: inviteDetailsSelect,
    });
    if (!invite) throw new NotFoundException("Invite not found");
    return invite;
  }

  async rsvpByToken(token: string, body: RsvpInviteDto): Promise<InviteResponseDto> {
    if (body.status !== "ACCEPTED" && body.status !== "DECLINED") {
      throw new BadRequestException("Invalid RSVP status");
    }

    const invite = await this.prisma.invite.findUnique({ where: { token }, select: { id: true } });
    if (!invite) throw new NotFoundException("Invite not found");

    return this.prisma.invite.update({
      where: { token },
      data: { status: body.status },
      select: inviteSelect,
    });
  }

  private async findOwnedBooking(userId: string, bookingId: string): Promise<{ id: string; status: BookingStatus }> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostUserId: userId },
      select: { id: true, status: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return booking;
  }

  private async findOwnedInvitableBooking(userId: string, bookingId: string): Promise<{ id: string; status: BookingStatus }> {
    const booking = await this.findOwnedBooking(userId, bookingId);
    if (booking.status !== BookingStatus.PENDING_PAYMENT && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Booking cannot accept invites");
    }
    return booking;
  }

  private normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      throw new BadRequestException("Invalid invite email");
    }
    return normalized;
  }

  private deriveName(email: string): string {
    return email.split("@")[0];
  }

  private async generateUniqueToken(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = randomBytes(24).toString("hex");
      const existing = await this.prisma.invite.findUnique({ where: { token }, select: { id: true } });
      if (!existing) return token;
    }
    throw new BadRequestException("Could not generate invite token");
  }
}
