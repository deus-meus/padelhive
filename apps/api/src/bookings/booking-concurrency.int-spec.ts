import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { VenueStatus, CourtType } from "@prisma/client";
import { BookingsService } from "./bookings.service";
import { PrismaService } from "../prisma/prisma.service";
import { execSync } from "child_process";
import { ConflictException } from "@nestjs/common";

describe("Booking Concurrency (Integration)", () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let service: BookingsService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    const databaseUrl = container.getConnectionUri();

    process.env.DATABASE_URL = databaseUrl;

    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: process.cwd(),
    });

    prisma = new PrismaService();
    await prisma.$connect();

    const owner = await prisma.user.create({
      data: {
        firebaseUid: "firebase-owner",
        email: "owner@padelhive.com",
        name: "Owner",
        role: "VENUE_OWNER",
      },
    });

    const venue = await prisma.venue.create({
      data: {
        id: "venue-int",
        ownerId: owner.id,
        name: "Int Venue",
        slug: "int-venue",
        location: "Jakarta",
        city: "Jakarta",
        description: "Integration test venue",
        openTime: "06:00",
        closeTime: "24:00",
        status: VenueStatus.APPROVED,
      },
    });

    await prisma.court.create({
      data: {
        id: "court-int",
        venueId: venue.id,
        name: "Court A",
        type: CourtType.OUTDOOR,
        isActive: true,
        weekdayPeak: 300000,
        weekdayOffPeak: 200000,
        weekendPeak: 400000,
        weekendOffPeak: 250000,
      },
    });

    await prisma.user.create({
      data: {
        id: "user-int",
        firebaseUid: "firebase-user",
        email: "player@padelhive.com",
        name: "Player",
      },
    });

    service = new BookingsService(prisma, {} as never, { createNotification: jest.fn() } as never);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  afterEach(async () => {
    await prisma.booking.deleteMany();
  });

  it("allows exact same slot if the existing booking is CANCELLED or EXPIRED", async () => {
    await service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
      amount: 1,
    } as never);

    const b = await prisma.booking.findFirst();
    await prisma.booking.update({ where: { id: b!.id }, data: { status: "CANCELLED" } });

    const newBooking = await service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
      amount: 1,
    } as never);

    expect(newBooking).toBeDefined();
  });

  it("allows adjacent non-overlapping bookings", async () => {
    const b1 = await service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "10:00",
      endsAt: "11:00",
      amount: 1,
    } as never);

    const b2 = await service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "11:00",
      endsAt: "12:00",
      amount: 1,
    } as never);

    expect(b1).toBeDefined();
    expect(b2).toBeDefined();
  });

  it("prevents double-booking via concurrent create calls", async () => {
    const promise1 = service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "14:00",
      endsAt: "16:00",
      amount: 1,
    } as never);

    const promise2 = service.createBookingForUser("user-int", {
      venueId: "venue-int",
      courtId: "court-int",
      bookingDate: "2099-06-01",
      startsAt: "14:00",
      endsAt: "16:00",
      amount: 1,
    } as never);

    const results = await Promise.allSettled([promise1, promise2]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    expect(rejected[0].reason).toBeInstanceOf(ConflictException);

    const count = await prisma.booking.count();
    expect(count).toBe(1);
  });
});
