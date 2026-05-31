import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BookingStatus, InviteStatus } from "@prisma/client";
import { InvitesService } from "./invites.service";

const pendingPaymentBooking = { id: "booking-1", status: BookingStatus.PENDING_PAYMENT };
const confirmedBooking = { id: "booking-2", status: BookingStatus.CONFIRMED };
const pendingBooking = { id: "booking-3", status: BookingStatus.PENDING };

const invite = {
  id: "invite-1",
  bookingId: "booking-1",
  userId: null,
  email: "friend@example.com",
  name: "friend",
  token: "invite-token-1",
  status: InviteStatus.PENDING,
  isHost: false,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
};

function createPrisma(overrides: Record<string, unknown> = {}) {
  return {
    booking: {
      findFirst: jest.fn().mockResolvedValue(pendingPaymentBooking),
    },
    invite: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([invite]),
      create: jest.fn().mockResolvedValue(invite),
      update: jest.fn().mockResolvedValue({ ...invite, status: InviteStatus.ACCEPTED }),
    },
    ...overrides,
  };
}

describe("InvitesService", () => {
  it("creates a pending invite for an owned pending-payment booking", async () => {
    const prisma = createPrisma();
    const service = new InvitesService(prisma as never);

    await expect(service.createInviteForBooking("user-1", "booking-1", { email: " Friend@Example.COM " })).resolves.toEqual(invite);

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: { id: true, status: true },
    });
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: { bookingId_email: { bookingId: "booking-1", email: "friend@example.com" } },
      select: expect.any(Object),
    });
    expect(prisma.invite.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "booking-1",
        email: "friend@example.com",
        name: "friend",
        status: InviteStatus.PENDING,
        isHost: false,
      }),
      select: expect.any(Object),
    });
    expect((prisma.invite.create as jest.Mock).mock.calls[0][0].data.token).toMatch(/^[a-f0-9]{48}$/);
  });

  it("allows confirmed bookings to receive invites", async () => {
    const prisma = createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue(confirmedBooking) } });
    const service = new InvitesService(prisma as never);

    await expect(service.createInviteForBooking("user-1", "booking-2", { email: "friend@example.com" })).resolves.toEqual(invite);
  });

  it("rejects missing or non-owned booking", async () => {
    const prisma = createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue(null) } });
    const service = new InvitesService(prisma as never);

    await expect(service.createInviteForBooking("user-2", "booking-1", { email: "friend@example.com" })).rejects.toThrow(NotFoundException);
    expect(prisma.invite.create).not.toHaveBeenCalled();
  });

  it("rejects booking statuses other than pending-payment or confirmed", async () => {
    const prisma = createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue(pendingBooking) } });
    const service = new InvitesService(prisma as never);

    await expect(service.createInviteForBooking("user-1", "booking-3", { email: "friend@example.com" })).rejects.toThrow(BadRequestException);
    expect(prisma.invite.create).not.toHaveBeenCalled();
  });

  it("returns existing invite for duplicate booking email", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue(invite),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.createInviteForBooking("user-1", "booking-1", { email: "FRIEND@example.com" })).resolves.toEqual(invite);
    expect(prisma.invite.create).not.toHaveBeenCalled();
  });

  it("lists invites only after owned booking lookup", async () => {
    const prisma = createPrisma();
    const service = new InvitesService(prisma as never);

    await expect(service.listInvitesForBooking("user-1", "booking-1")).resolves.toEqual([invite]);
    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: { id: true, status: true },
    });
    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      where: { bookingId: "booking-1" },
      select: expect.any(Object),
      orderBy: { createdAt: "asc" },
    });
  });

  it("updates RSVP by public token when status is accepted or declined", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ id: "invite-1" }),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({ ...invite, status: InviteStatus.DECLINED }),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.rsvpByToken("invite-token-1", { status: "DECLINED" })).resolves.toEqual({ ...invite, status: InviteStatus.DECLINED });
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: { token: "invite-token-1" },
      data: { status: "DECLINED" },
      select: expect.any(Object),
    });
  });

  it("rejects invalid RSVP status and missing token", async () => {
    const invalidStatusPrisma = createPrisma();
    const invalidStatusService = new InvitesService(invalidStatusPrisma as never);

    await expect(invalidStatusService.rsvpByToken("invite-token-1", { status: "PENDING" as never })).rejects.toThrow(BadRequestException);
    expect(invalidStatusPrisma.invite.update).not.toHaveBeenCalled();

    const missingTokenPrisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    });
    const missingTokenService = new InvitesService(missingTokenPrisma as never);

    await expect(missingTokenService.rsvpByToken("missing-token", { status: "ACCEPTED" })).rejects.toThrow(NotFoundException);
    expect(missingTokenPrisma.invite.update).not.toHaveBeenCalled();
  });
});
