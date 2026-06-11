import { 
  PrismaClient, UserRole, VenueStatus, CourtType, 
  BookingStatus, PaymentStatus, InviteStatus, RefundStatus, VoucherType 
} from "@prisma/client";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (process.env.NODE_ENV === "production") {
  console.error("Do not run this seed in production!");
  process.exit(1);
}

const prisma = new PrismaClient();

let firebaseEnabled = false;

try {
  if (!getApps().length) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
      firebaseEnabled = true;
    } else if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'padelhive' });
      firebaseEnabled = true;
    }
  } else {
    firebaseEnabled = true;
  }
} catch (error) {
  console.warn("Firebase admin initialization failed, proceeding with local uids", error);
}

const ACCOUNTS = [
  { email: "admin@padelhive.com", password: "Padel#Super1", role: UserRole.SUPER_ADMIN, name: "Admin Padelhive", phone: "+6281234567899" },
  { email: "budi.owner@padelhive.com", password: "Padel#Owner1", role: UserRole.VENUE_OWNER, name: "Budi Santoso", phone: "+6281234567892" },
  { email: "reza.owner@padelhive.com", password: "Padel#Owner2", role: UserRole.VENUE_OWNER, name: "Reza Hakim", phone: "+6281234567812" },
  { email: "maya.owner@padelhive.com", password: "Padel#Owner3", role: UserRole.VENUE_OWNER, name: "Maya Putri", phone: "+6281234567822" },
  { email: "lisa.admin@padelhive.com", password: "Padel#Admin1", role: UserRole.VENUE_ADMIN, name: "Lisa Tanaka", phone: "+6281234567833" },
  { email: "andi@example.com", password: "Padel#Player1", role: UserRole.PLAYER, name: "Andi Pratama", phone: "+6281234567890" },
  { email: "sari@example.com", password: "Padel#Player2", role: UserRole.PLAYER, name: "Sari Dewi", phone: "+6281234567891" },
  { email: "budi.player@padelhive.com", password: "Padel#Player3", role: UserRole.PLAYER, name: "Budi Rahmat", phone: "+6281234567801" },
];

async function resolveUid(account: any): Promise<string> {
  if (!firebaseEnabled) return "local-" + account.email;
  const auth = getAuth();
  try {
    const user = await auth.getUserByEmail(account.email);
    await auth.updateUser(user.uid, { password: account.password });
    return user.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      const user = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.name,
        emailVerified: true
      });
      return user.uid;
    }
    throw error;
  }
}

const now = new Date();

function getWibMidnight(offsetDays: number): Date {
  const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const wibDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(wibDate.getUTCFullYear(), wibDate.getUTCMonth(), wibDate.getUTCDate()));
}

function getWibTime(offsetDays: number, hours: number, minutes: number = 0): Date {
  const midnight = getWibMidnight(offsetDays);
  return new Date(midnight.getTime() + (hours - 7) * 60 * 60 * 1000 + minutes * 60 * 1000);
}

async function main() {
  console.log("Seeding with Firebase enabled:", firebaseEnabled);

  console.log("Wiping existing data...");
  await prisma.$transaction([
    prisma.refundEvent.deleteMany(),
    prisma.refund.deleteMany(),
    prisma.bookingSplitShare.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invite.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.court.deleteMany(),
    prisma.venueAdmin.deleteMany(),
    prisma.venue.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Creating users...");
  const usersRecord: Record<string, any> = {};
  for (const acc of ACCOUNTS) {
    const uid = await resolveUid(acc);
    const u = await prisma.user.create({
      data: {
        email: acc.email,
        name: acc.name,
        role: acc.role,
        phone: acc.phone,
        firebaseUid: uid,
      }
    });
    usersRecord[acc.email] = u;
  }

  console.log("Creating venues & courts...");
  const bali = await prisma.venue.create({
    data: {
      ownerId: usersRecord["budi.owner@padelhive.com"].id,
      status: VenueStatus.APPROVED,
      name: "Padel Bali Arena",
      slug: "padel-bali-arena",
      location: "Jl. Sunset Road No. 88, Seminyak",
      city: "Bali",
      description: "Premium padel courts in the heart of Seminyak with ocean breeze and clubhouse facilities.",
      imageUrl: "https://images.unsplash.com/photo-1622279457486-640ca4a4ea6b?auto=format&fit=crop&w=1200&q=80",
      photos: ["https://images.unsplash.com/photo-1622279457486-640ca4a4ea6b?auto=format&fit=crop&w=1200&q=80"],
      facilities: ["Parking", "Shower", "Locker", "Pro Shop", "Cafe", "WiFi"],
      openTime: "06:00",
      closeTime: "22:00",
      rating: 4.8,
      reviewCount: 124,
      commissionRate: 10,
    }
  });

  const jakarta = await prisma.venue.create({
    data: {
      ownerId: usersRecord["reza.owner@padelhive.com"].id,
      status: VenueStatus.APPROVED,
      name: "Jakarta Padel Club",
      slug: "jakarta-padel-club",
      location: "Jl. Sudirman Kav. 52, SCBD",
      city: "Jakarta",
      description: "State-of-the-art indoor padel facility in Jakarta's business district.",
      imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?auto=format&fit=crop&w=1200&q=80",
      photos: ["https://images.unsplash.com/photo-1554068865-24cecd4e34d8?auto=format&fit=crop&w=1200&q=80"],
      facilities: ["Parking", "Shower", "Locker", "Cafe", "AC"],
      openTime: "07:00",
      closeTime: "23:00",
      rating: 4.6,
      reviewCount: 89,
      commissionRate: 12,
    }
  });

  const surabaya = await prisma.venue.create({
    data: {
      ownerId: usersRecord["maya.owner@padelhive.com"].id,
      status: VenueStatus.PENDING,
      name: "Surabaya Padel Center",
      slug: "surabaya-padel-center",
      location: "Jl. Basuki Rahmat No. 100",
      city: "Surabaya",
      description: "East Java's first dedicated padel center with 6 courts and professional coaching.",
      imageUrl: "https://images.unsplash.com/photo-1530915534664-4ac6423816b7?auto=format&fit=crop&w=1200&q=80",
      photos: ["https://images.unsplash.com/photo-1530915534664-4ac6423816b7?auto=format&fit=crop&w=1200&q=80"],
      facilities: ["Parking", "Shower", "Coaching", "Equipment Rental"],
      openTime: "06:00",
      closeTime: "21:00",
      rating: 4.5,
      reviewCount: 56,
      commissionRate: 9.5,
    }
  });

  await prisma.venueAdmin.create({
    data: {
      venueId: bali.id,
      userId: usersRecord["lisa.admin@padelhive.com"].id,
    }
  });

  const courtA = await prisma.court.create({ data: { venueId: bali.id, name: "Court A", type: CourtType.OUTDOOR, weekdayPeak: 300000, weekdayOffPeak: 200000, weekendPeak: 400000, weekendOffPeak: 250000 } });
  await prisma.court.create({ data: { venueId: bali.id, name: "Court B", type: CourtType.OUTDOOR, weekdayPeak: 300000, weekdayOffPeak: 200000, weekendPeak: 400000, weekendOffPeak: 250000 } });
  const court1 = await prisma.court.create({ data: { venueId: jakarta.id, name: "Court 1", type: CourtType.INDOOR, weekdayPeak: 400000, weekdayOffPeak: 280000, weekendPeak: 500000, weekendOffPeak: 350000 } });
  await prisma.court.create({ data: { venueId: jakarta.id, name: "Court 2", type: CourtType.INDOOR, weekdayPeak: 400000, weekdayOffPeak: 280000, weekendPeak: 500000, weekendOffPeak: 350000 } });
  const courtUtama = await prisma.court.create({ data: { venueId: surabaya.id, name: "Court Utama", type: CourtType.INDOOR, weekdayPeak: 250000, weekdayOffPeak: 180000, weekendPeak: 350000, weekendOffPeak: 220000 } });
  await prisma.court.create({ data: { venueId: surabaya.id, name: "Court Latihan", type: CourtType.OUTDOOR, weekdayPeak: 200000, weekdayOffPeak: 150000, weekendPeak: 280000, weekendOffPeak: 180000 } });

  console.log("Creating vouchers...");
  const v1 = await prisma.voucher.create({ data: { code: "WELCOME20", type: VoucherType.PERCENTAGE, value: 20, minPurchase: 200000, maxDiscount: 100000, usageLimit: 500, usedCount: 1, isActive: true, validFrom: getWibMidnight(-30), validUntil: getWibMidnight(30) } });
  const v2 = await prisma.voucher.create({ data: { code: "PLAYMORE50", type: VoucherType.NOMINAL, value: 50000, minPurchase: 300000, maxDiscount: 50000, usageLimit: 200, usedCount: 1, isActive: true, validFrom: getWibMidnight(-30), validUntil: getWibMidnight(30) } });
  const v3 = await prisma.voucher.create({ data: { code: "WEEKEND10", type: VoucherType.PERCENTAGE, value: 10, minPurchase: 150000, maxDiscount: 50000, usageLimit: 1000, usedCount: 0, isActive: true, validFrom: getWibMidnight(-30), validUntil: getWibMidnight(30) } });

  console.log("Creating bookings...");
  const bUpcoming = await prisma.booking.create({
    data: {
      id: "booking-upcoming",
      hostUserId: usersRecord["andi@example.com"].id,
      venueId: bali.id, courtId: courtA.id, voucherId: v1.id,
      bookingDate: getWibMidnight(5), startsAt: getWibTime(5, 9, 0), endsAt: getWibTime(5, 10, 0),
      durationMinutes: 60, status: BookingStatus.CONFIRMED,
      courtAmount: 300000, platformFee: 15000, voucherDiscount: 63000, finalAmount: 252000
    }
  });

  const bCompleted = await prisma.booking.create({
    data: {
      id: "booking-completed",
      hostUserId: usersRecord["sari@example.com"].id,
      venueId: jakarta.id, courtId: court1.id, voucherId: v2.id,
      bookingDate: getWibMidnight(-14), startsAt: getWibTime(-14, 18, 0), endsAt: getWibTime(-14, 19, 30),
      durationMinutes: 90, status: BookingStatus.COMPLETED,
      courtAmount: 500000, platformFee: 25000, voucherDiscount: 50000, finalAmount: 475000,
      completedAt: getWibTime(-14, 20, 0)
    }
  });

  const bCancelled = await prisma.booking.create({
    data: {
      id: "booking-cancelled",
      hostUserId: usersRecord["budi.player@padelhive.com"].id,
      venueId: surabaya.id, courtId: courtUtama.id, voucherId: v3.id,
      bookingDate: getWibMidnight(-20), startsAt: getWibTime(-20, 10, 0), endsAt: getWibTime(-20, 11, 0),
      durationMinutes: 60, status: BookingStatus.CANCELLED,
      courtAmount: 250000, platformFee: 12500, voucherDiscount: 26250, finalAmount: 236250,
      cancelledAt: getWibTime(-21, 10, 0)
    }
  });

  console.log("Creating payments...");
  const pUpcoming = await prisma.payment.create({
    data: { id: "payment-upcoming", bookingId: bUpcoming.id, status: PaymentStatus.PAID, provider: "midtrans", method: "ewallet", amount: 252000, paidAt: getWibTime(-1, 9, 0), providerReference: "MT-UPCOMING" }
  });
  const pCompleted = await prisma.payment.create({
    data: { id: "payment-completed", bookingId: bCompleted.id, status: PaymentStatus.PAID, provider: "midtrans", method: "va", amount: 475000, paidAt: getWibTime(-14, 17, 30), providerReference: "MT-COMPLETED" }
  });
  const pCancelled = await prisma.payment.create({
    data: { id: "payment-cancelled", bookingId: bCancelled.id, status: PaymentStatus.PAID, provider: "midtrans", method: "ewallet", amount: 236250, paidAt: getWibTime(-21, 9, 0), providerReference: "MT-CANCELLED" }
  });

  console.log("Creating invites...");
  const iAndi = await prisma.invite.create({
    data: { id: "invite-andi", bookingId: bUpcoming.id, status: InviteStatus.ACCEPTED, isHost: true, userId: usersRecord["andi@example.com"].id, email: "andi@example.com", name: "Andi Pratama", token: "invite-andi" }
  });
  const iSari = await prisma.invite.create({
    data: { id: "invite-sari", bookingId: bUpcoming.id, status: InviteStatus.PENDING, isHost: false, userId: usersRecord["sari@example.com"].id, email: "sari@example.com", name: "Sari Dewi", token: "invite-sari" }
  });
  await prisma.invite.create({
    data: { id: "invite-budi", bookingId: bUpcoming.id, status: InviteStatus.DECLINED, isHost: false, userId: usersRecord["budi.player@padelhive.com"].id, email: "budi.player@padelhive.com", name: "Budi Rahmat", token: "invite-budi" }
  });

  console.log("Creating refunds & events...");
  const rPending = await prisma.refund.create({
    data: { id: "refund-pending", bookingId: bCancelled.id, paymentId: pCancelled.id, amount: 236250, reason: "User cancelled within refund window", status: RefundStatus.PENDING, adminNotes: "Awaiting finance review" }
  });
  const rProcessed = await prisma.refund.create({
    data: { id: "refund-processed", bookingId: bCompleted.id, paymentId: pCompleted.id, amount: 50000, reason: "Partial refund due to court maintenance", status: RefundStatus.PROCESSED, adminNotes: "Processed via manual transfer", processedAt: getWibTime(-13, 10, 0) }
  });

  await prisma.refundEvent.create({ data: { refundId: rPending.id, fromStatus: null, toStatus: RefundStatus.PENDING, actorUserId: usersRecord["budi.player@padelhive.com"].id, createdAt: getWibTime(-21, 10, 0) } });
  
  await prisma.refundEvent.create({ data: { refundId: rProcessed.id, fromStatus: null, toStatus: RefundStatus.PENDING, actorUserId: usersRecord["sari@example.com"].id, createdAt: getWibTime(-13, 9, 0) } });
  await prisma.refundEvent.create({ data: { refundId: rProcessed.id, fromStatus: RefundStatus.PENDING, toStatus: RefundStatus.APPROVED, actorUserId: usersRecord["admin@padelhive.com"].id, createdAt: getWibTime(-13, 10, 0) } });
  await prisma.refundEvent.create({ data: { refundId: rProcessed.id, fromStatus: RefundStatus.APPROVED, toStatus: RefundStatus.PROCESSED, actorUserId: usersRecord["admin@padelhive.com"].id, createdAt: getWibTime(-13, 10, 0) } });

  console.log("Creating split shares...");
  await prisma.bookingSplitShare.create({
    data: { bookingId: bUpcoming.id, inviteId: iAndi.id, userId: usersRecord["andi@example.com"].id, name: "Andi Pratama", amount: 126000, status: PaymentStatus.PAID, paidAt: getWibTime(-1, 9, 0) }
  });
  await prisma.bookingSplitShare.create({
    data: { bookingId: bUpcoming.id, inviteId: iSari.id, userId: usersRecord["sari@example.com"].id, name: "Sari Dewi", amount: 126000, status: PaymentStatus.PENDING }
  });

  console.log("Seeding complete!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
