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

const inviteDetails = {
  ...invite,
  booking: {
    id: "booking-1",
    bookingDate: new Date("2026-06-10T00:00:00.000Z"),
    startsAt: new Date("2026-06-10T09:00:00.000Z"),
    endsAt: new Date("2026-06-10T11:00:00.000Z"),
    status: BookingStatus.CONFIRMED,
    venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
    court: { id: "court-1", name: "Court A", type: "OUTDOOR" },
    host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
  },
};

function createPrisma(overrides: Record<string, unknown> = {}) {
  return {
    booking: {
      findFirst: jest.fn().mockResolvedValue(pendingPaymentBooking),
    },
    invite: {
      findUnique: jest.fn().mockResolvedValue(null),
      findUniqueOrThrow: jest.fn().mockResolvedValue(invite),
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

  it("returns public invite details by token", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue(inviteDetails),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.getInviteByToken("invite-token-1")).resolves.toEqual(inviteDetails);
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: { token: "invite-token-1" },
      select: expect.objectContaining({
        id: true,
        booking: expect.any(Object),
      }),
    });
  });

  it("throws not found for missing public invite token", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.getInviteByToken("missing-token")).rejects.toThrow(NotFoundException);
  });

  it("updates RSVP by public token when status is accepted or declined", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: "invite-1", 
          status: InviteStatus.PENDING, 
          isHost: false, 
          booking: { status: BookingStatus.CONFIRMED, startsAt: new Date(Date.now() + 86400000) } 
        }),
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

  it("safely no-ops and returns the invite if re-submitting the exact same status", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: "invite-1", 
          status: InviteStatus.ACCEPTED, 
          isHost: false, 
          booking: { status: BookingStatus.CONFIRMED, startsAt: new Date(Date.now() + 86400000) } 
        }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ ...invite, status: InviteStatus.ACCEPTED }),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.rsvpByToken("invite-token-1", { status: "ACCEPTED" })).resolves.toEqual({ ...invite, status: InviteStatus.ACCEPTED });
    expect((prisma.invite as unknown as { findUniqueOrThrow: jest.Mock }).findUniqueOrThrow).toHaveBeenCalledWith({
      where: { token: "invite-token-1" },
      select: expect.any(Object),
    });
    expect(prisma.invite.update).not.toHaveBeenCalled();
  });

  it("rejects RSVP with 400 if booking is CANCELLED (or EXPIRED/COMPLETED)", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: "invite-1", 
          status: InviteStatus.ACCEPTED, // Same status, testing that guard wins over idempotency
          isHost: false, 
          booking: { status: BookingStatus.CANCELLED, startsAt: new Date(Date.now() + 86400000) } 
        }),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.rsvpByToken("invite-token-1", { status: "ACCEPTED" })).rejects.toThrow(BadRequestException);
    expect(prisma.invite.update).not.toHaveBeenCalled();
  });

  it("rejects RSVP with 400 if booking has already started", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: "invite-1", 
          status: InviteStatus.PENDING, 
          isHost: false, 
          booking: { status: BookingStatus.CONFIRMED, startsAt: new Date(Date.now() - 86400000) } 
        }),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.rsvpByToken("invite-token-1", { status: "ACCEPTED" })).rejects.toThrow(BadRequestException);
    expect(prisma.invite.update).not.toHaveBeenCalled();
  });

  it("rejects RSVP with 400 if the invite is for the host (isHost === true)", async () => {
    const prisma = createPrisma({
      invite: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: "invite-1", 
          status: InviteStatus.PENDING, 
          isHost: true, 
          booking: { status: BookingStatus.CONFIRMED, startsAt: new Date(Date.now() + 86400000) } 
        }),
        update: jest.fn(),
      },
    });
    const service = new InvitesService(prisma as never);

    await expect(service.rsvpByToken("invite-token-1", { status: "ACCEPTED" })).rejects.toThrow(BadRequestException);
    expect(prisma.invite.update).not.toHaveBeenCalled();
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
