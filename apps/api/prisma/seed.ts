import { PrismaClient, UserRole, VenueStatus, CourtType, BookingStatus, PaymentStatus, InviteStatus, RefundStatus, VoucherType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@padelhive.com" },
    update: {},
    create: {
      firebaseUid: "firebase-admin-1",
      role: UserRole.SUPER_ADMIN,
      name: "Admin Padelhive",
      email: "admin@padelhive.com",
      phone: "+6281234567899",
    },
  });

  const ownerBali = await prisma.user.upsert({
    where: { email: "budi.owner@padelhive.com" },
    update: {},
    create: {
      firebaseUid: "firebase-owner-1",
      role: UserRole.VENUE_OWNER,
      name: "Budi Santoso",
      email: "budi.owner@padelhive.com",
      phone: "+6281234567892",
    },
  });

  const ownerJakarta = await prisma.user.upsert({
    where: { email: "reza.owner@padelhive.com" },
    update: {},
    create: {
      firebaseUid: "firebase-owner-2",
      role: UserRole.VENUE_OWNER,
      name: "Reza Hakim",
      email: "reza.owner@padelhive.com",
      phone: "+6281234567812",
    },
  });

  const ownerSurabaya = await prisma.user.upsert({
    where: { email: "maya.owner@padelhive.com" },
    update: {},
    create: {
      firebaseUid: "firebase-owner-3",
      role: UserRole.VENUE_OWNER,
      name: "Maya Putri",
      email: "maya.owner@padelhive.com",
      phone: "+6281234567822",
    },
  });

  const venueAdmin = await prisma.user.upsert({
    where: { email: "lisa.admin@padelhive.com" },
    update: {},
    create: {
      firebaseUid: "firebase-admin-venue-1",
      role: UserRole.VENUE_ADMIN,
      name: "Lisa Tanaka",
      email: "lisa.admin@padelhive.com",
      phone: "+6281234567833",
    },
  });

  const players = await Promise.all([
    prisma.user.upsert({
      where: { email: "andi@example.com" },
      update: {},
      create: {
        firebaseUid: "firebase-player-1",
        role: UserRole.PLAYER,
        name: "Andi Pratama",
        email: "andi@example.com",
        phone: "+6281234567890",
      },
    }),
    prisma.user.upsert({
      where: { email: "sari@example.com" },
      update: {},
      create: {
        firebaseUid: "firebase-player-2",
        role: UserRole.PLAYER,
        name: "Sari Dewi",
        email: "sari@example.com",
        phone: "+6281234567891",
      },
    }),
    prisma.user.upsert({
      where: { email: "budi.player@padelhive.com" },
      update: {},
      create: {
        firebaseUid: "firebase-player-3",
        role: UserRole.PLAYER,
        name: "Budi Rahmat",
        email: "budi.player@padelhive.com",
        phone: "+6281234567801",
      },
    }),
  ]);

  const baliVenue = await prisma.venue.upsert({
    where: { slug: "padel-bali-arena" },
    update: {},
    create: {
      ownerId: ownerBali.id,
      status: VenueStatus.APPROVED,
      name: "Padel Bali Arena",
      slug: "padel-bali-arena",
      location: "Jl. Sunset Road No. 88, Seminyak",
      city: "Bali",
      description: "Premium padel courts in the heart of Seminyak with ocean breeze and clubhouse facilities.",
      imageUrl: "/venues/bali-arena.jpg",
      photos: ["/venues/bali-arena-1.jpg", "/venues/bali-arena-2.jpg", "/venues/bali-arena-3.jpg"],
      facilities: ["Parking", "Shower", "Locker", "Pro Shop", "Cafe", "WiFi"],
      openTime: "06:00",
      closeTime: "22:00",
      rating: 4.8,
      reviewCount: 124,
      commissionRate: 10,
    },
  });

  const jakartaVenue = await prisma.venue.upsert({
    where: { slug: "jakarta-padel-club" },
    update: {},
    create: {
      ownerId: ownerJakarta.id,
      status: VenueStatus.APPROVED,
      name: "Jakarta Padel Club",
      slug: "jakarta-padel-club",
      location: "Jl. Sudirman Kav. 52, SCBD",
      city: "Jakarta",
      description: "State-of-the-art indoor padel facility in Jakarta's business district.",
      imageUrl: "/venues/jakarta-club.jpg",
      photos: ["/venues/jakarta-club-1.jpg", "/venues/jakarta-club-2.jpg"],
      facilities: ["Parking", "Shower", "Locker", "Cafe", "AC"],
      openTime: "07:00",
      closeTime: "23:00",
      rating: 4.6,
      reviewCount: 89,
      commissionRate: 12,
    },
  });

  const surabayaVenue = await prisma.venue.upsert({
    where: { slug: "surabaya-padel-center" },
    update: {},
    create: {
      ownerId: ownerSurabaya.id,
      status: VenueStatus.PENDING,
      name: "Surabaya Padel Center",
      slug: "surabaya-padel-center",
      location: "Jl. Basuki Rahmat No. 100",
      city: "Surabaya",
      description: "East Java's first dedicated padel center with 6 courts and professional coaching.",
      imageUrl: "/venues/surabaya-center.jpg",
      photos: ["/venues/surabaya-center-1.jpg", "/venues/surabaya-center-2.jpg"],
      facilities: ["Parking", "Shower", "Coaching", "Equipment Rental"],
      openTime: "06:00",
      closeTime: "21:00",
      rating: 4.5,
      reviewCount: 56,
      commissionRate: 9.5,
    },
  });

  await prisma.venueAdmin.upsert({
    where: { venueId_userId: { venueId: baliVenue.id, userId: venueAdmin.id } },
    update: {},
    create: {
      venueId: baliVenue.id,
      userId: venueAdmin.id,
    },
  });

  const courts = await prisma.$transaction([
    prisma.court.upsert({
      where: { venueId_name: { venueId: baliVenue.id, name: "Court A" } },
      update: {},
      create: {
        venueId: baliVenue.id,
        name: "Court A",
        type: CourtType.OUTDOOR,
        weekdayPeak: 300000,
        weekdayOffPeak: 200000,
        weekendPeak: 400000,
        weekendOffPeak: 250000,
      },
    }),
    prisma.court.upsert({
      where: { venueId_name: { venueId: baliVenue.id, name: "Court B" } },
      update: {},
      create: {
        venueId: baliVenue.id,
        name: "Court B",
        type: CourtType.OUTDOOR,
        weekdayPeak: 300000,
        weekdayOffPeak: 200000,
        weekendPeak: 400000,
        weekendOffPeak: 250000,
      },
    }),
    prisma.court.upsert({
      where: { venueId_name: { venueId: jakartaVenue.id, name: "Court 1" } },
      update: {},
      create: {
        venueId: jakartaVenue.id,
        name: "Court 1",
        type: CourtType.INDOOR,
        weekdayPeak: 400000,
        weekdayOffPeak: 280000,
        weekendPeak: 500000,
        weekendOffPeak: 350000,
      },
    }),
    prisma.court.upsert({
      where: { venueId_name: { venueId: jakartaVenue.id, name: "Court 2" } },
      update: {},
      create: {
        venueId: jakartaVenue.id,
        name: "Court 2",
        type: CourtType.INDOOR,
        weekdayPeak: 400000,
        weekdayOffPeak: 280000,
        weekendPeak: 500000,
        weekendOffPeak: 350000,
      },
    }),
    prisma.court.upsert({
      where: { venueId_name: { venueId: surabayaVenue.id, name: "Court Utama" } },
      update: {},
      create: {
        venueId: surabayaVenue.id,
        name: "Court Utama",
        type: CourtType.INDOOR,
        weekdayPeak: 250000,
        weekdayOffPeak: 180000,
        weekendPeak: 350000,
        weekendOffPeak: 220000,
      },
    }),
    prisma.court.upsert({
      where: { venueId_name: { venueId: surabayaVenue.id, name: "Court Latihan" } },
      update: {},
      create: {
        venueId: surabayaVenue.id,
        name: "Court Latihan",
        type: CourtType.OUTDOOR,
        weekdayPeak: 200000,
        weekdayOffPeak: 150000,
        weekendPeak: 280000,
        weekendOffPeak: 180000,
      },
    }),
  ]);

  const [voucherWelcome, voucherPlayMore, voucherWeekend] = await Promise.all([
    prisma.voucher.upsert({
      where: { code: "WELCOME20" },
      update: {},
      create: {
        code: "WELCOME20",
        type: VoucherType.PERCENTAGE,
        value: 20,
        minPurchase: 200000,
        maxDiscount: 100000,
        usageLimit: 500,
        usedCount: 342,
        validFrom: new Date("2026-05-01T00:00:00Z"),
        validUntil: new Date("2026-06-30T23:59:59Z"),
        isActive: true,
      },
    }),
    prisma.voucher.upsert({
      where: { code: "PLAYMORE50" },
      update: {},
      create: {
        code: "PLAYMORE50",
        type: VoucherType.NOMINAL,
        value: 50000,
        minPurchase: 300000,
        maxDiscount: 50000,
        usageLimit: 200,
        usedCount: 87,
        validFrom: new Date("2026-05-15T00:00:00Z"),
        validUntil: new Date("2026-07-15T23:59:59Z"),
        isActive: true,
      },
    }),
    prisma.voucher.upsert({
      where: { code: "WEEKEND10" },
      update: {},
      create: {
        code: "WEEKEND10",
        type: VoucherType.PERCENTAGE,
        value: 10,
        minPurchase: 150000,
        maxDiscount: 50000,
        usageLimit: 1000,
        usedCount: 621,
        validFrom: new Date("2026-05-01T00:00:00Z"),
        validUntil: new Date("2026-06-01T23:59:59Z"),
        isActive: true,
      },
    }),
  ]);

  const bookingUpcoming = await prisma.booking.upsert({
    where: { id: "booking-upcoming" },
    update: {},
    create: {
      id: "booking-upcoming",
      hostUserId: players[0].id,
      venueId: baliVenue.id,
      courtId: courts[0].id,
      voucherId: voucherWelcome.id,
      bookingDate: new Date("2026-06-02"),
      startsAt: new Date("2026-06-02T09:00:00Z"),
      endsAt: new Date("2026-06-02T10:00:00Z"),
      durationMinutes: 60,
      status: BookingStatus.CONFIRMED,
      courtAmount: 300000,
      platformFee: 15000,
      voucherDiscount: 60000,
      finalAmount: 255000,
    },
  });

  const bookingCompleted = await prisma.booking.upsert({
    where: { id: "booking-completed" },
    update: {},
    create: {
      id: "booking-completed",
      hostUserId: players[1].id,
      venueId: jakartaVenue.id,
      courtId: courts[2].id,
      voucherId: voucherPlayMore.id,
      bookingDate: new Date("2026-05-25"),
      startsAt: new Date("2026-05-25T18:00:00Z"),
      endsAt: new Date("2026-05-25T19:30:00Z"),
      durationMinutes: 90,
      status: BookingStatus.COMPLETED,
      courtAmount: 500000,
      platformFee: 25000,
      voucherDiscount: 50000,
      finalAmount: 475000,
      completedAt: new Date("2026-05-25T20:00:00Z"),
    },
  });

  const bookingCancelled = await prisma.booking.upsert({
    where: { id: "booking-cancelled" },
    update: {},
    create: {
      id: "booking-cancelled",
      hostUserId: players[2].id,
      venueId: surabayaVenue.id,
      courtId: courts[4].id,
      voucherId: voucherWeekend.id,
      bookingDate: new Date("2026-05-15"),
      startsAt: new Date("2026-05-15T10:00:00Z"),
      endsAt: new Date("2026-05-15T11:00:00Z"),
      durationMinutes: 60,
      status: BookingStatus.CANCELLED,
      courtAmount: 250000,
      platformFee: 12500,
      voucherDiscount: 30000,
      finalAmount: 232500,
      cancelledAt: new Date("2026-05-14T08:00:00Z"),
    },
  });

  const paymentUpcoming = await prisma.payment.upsert({
    where: { bookingId: bookingUpcoming.id },
    update: {},
    create: {
      bookingId: bookingUpcoming.id,
      amount: bookingUpcoming.finalAmount,
      status: PaymentStatus.PAID,
      provider: "midtrans",
      method: "GoPay",
      paidAt: new Date("2026-05-28T14:30:00Z"),
      providerReference: "MT-20260528-0001",
    },
  });

  const paymentCompleted = await prisma.payment.upsert({
    where: { bookingId: bookingCompleted.id },
    update: {},
    create: {
      bookingId: bookingCompleted.id,
      amount: bookingCompleted.finalAmount,
      status: PaymentStatus.PAID,
      provider: "xendit",
      method: "BCA Virtual Account",
      paidAt: new Date("2026-05-25T17:30:00Z"),
      providerReference: "XEN-20260525-0451",
    },
  });

  const paymentCancelled = await prisma.payment.upsert({
    where: { bookingId: bookingCancelled.id },
    update: {},
    create: {
      bookingId: bookingCancelled.id,
      amount: bookingCancelled.finalAmount,
      status: PaymentStatus.REFUNDED,
      provider: "midtrans",
      method: "DANA",
      paidAt: new Date("2026-05-13T08:00:00Z"),
      providerReference: "MT-20260513-0099",
      failedAt: new Date("2026-05-13T08:10:00Z"),
    },
  });

  await prisma.invite.upsert({
    where: { token: "invite-andi" },
    update: {},
    create: {
      bookingId: bookingUpcoming.id,
      email: "andi@example.com",
      name: "Andi Pratama",
      token: "invite-andi",
      status: InviteStatus.ACCEPTED,
      userId: players[0].id,
      isHost: true,
    },
  });

  await prisma.invite.upsert({
    where: { token: "invite-sari" },
    update: {},
    create: {
      bookingId: bookingUpcoming.id,
      email: "sari@example.com",
      name: "Sari Dewi",
      token: "invite-sari",
      status: InviteStatus.PENDING,
      userId: players[1].id,
    },
  });

  await prisma.invite.upsert({
    where: { token: "invite-budi" },
    update: {},
    create: {
      bookingId: bookingUpcoming.id,
      email: "budi.player@padelhive.com",
      name: "Budi Rahmat",
      token: "invite-budi",
      status: InviteStatus.DECLINED,
      userId: players[2].id,
    },
  });

  await prisma.refund.upsert({
    where: { id: "refund-pending" },
    update: {},
    create: {
      id: "refund-pending",
      bookingId: bookingCancelled.id,
      paymentId: paymentCancelled.id,
      amount: 232500,
      reason: "User cancelled within refund window",
      status: RefundStatus.PENDING,
      adminNotes: "Awaiting finance review",
    },
  });

  await prisma.refund.upsert({
    where: { id: "refund-processed" },
    update: {},
    create: {
      id: "refund-processed",
      bookingId: bookingCompleted.id,
      paymentId: paymentCompleted.id,
      amount: 50000,
      reason: "Partial refund due to court maintenance",
      status: RefundStatus.PROCESSED,
      adminNotes: "Processed via manual transfer",
      processedAt: new Date("2026-05-26T10:00:00Z"),
    },
  });

  await prisma.payment.update({
    where: { id: paymentCompleted.id },
    data: { refund: { connect: { id: "refund-processed" } } },
  });

  await prisma.payment.update({
    where: { id: paymentCancelled.id },
    data: { refund: { connect: { id: "refund-pending" } } },
  });

  await prisma.payment.update({
    where: { id: paymentUpcoming.id },
    data: {},
  });

  void superAdmin;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
