export const adminKPIs = {
  gmv: 847_500_000,
  gmvTrend: "+12%",
  commissionRevenue: 84_750_000,
  commissionTrend: "+18%",
  totalBookings: 3_842,
  bookingsTrend: "+24%",
  activeVenues: 28,
  venuesTrend: "+3",
  pendingApprovals: 5,
  refundRequests: 7,
  disputes: 4,
  paymentSuccessRate: 94.2,
};

export type VenueApproval = {
  id: string;
  name: string;
  ownerName: string;
  city: string;
  courts: number;
  submittedAt: string;
  documents: string[];
  status: "pending" | "approved" | "rejected";
};

export const venueApprovals: VenueApproval[] = [
  { id: "va-1", name: "Padel Paradise Canggu", ownerName: "Made Wirawan", city: "Bali", courts: 4, submittedAt: "2026-05-27", documents: ["business_license.pdf", "venue_photos.zip"], status: "pending" },
  { id: "va-2", name: "Menteng Padel House", ownerName: "Andi Pratama", city: "Jakarta", courts: 3, submittedAt: "2026-05-24", documents: ["business_license.pdf", "floor_plan.pdf"], status: "pending" },
  { id: "va-3", name: "Surabaya Padel Hub", ownerName: "Budi Santoso", city: "Surabaya", courts: 5, submittedAt: "2026-05-22", documents: ["business_license.pdf"], status: "pending" },
  { id: "va-4", name: "Seminyak Padel Club", ownerName: "Ketut Darma", city: "Bali", courts: 2, submittedAt: "2026-05-20", documents: ["business_license.pdf", "venue_photos.zip"], status: "pending" },
  { id: "va-5", name: "PIK Padel Arena", ownerName: "Steven Lim", city: "Jakarta", courts: 6, submittedAt: "2026-05-18", documents: ["business_license.pdf", "floor_plan.pdf", "venue_photos.zip"], status: "pending" },
  { id: "va-6", name: "Padel Bali Arena", ownerName: "Wayan Sudira", city: "Bali", courts: 4, submittedAt: "2026-05-10", documents: ["business_license.pdf"], status: "approved" },
  { id: "va-7", name: "Jakarta Padel Club", ownerName: "Reza Hakim", city: "Jakarta", courts: 3, submittedAt: "2026-05-08", documents: ["business_license.pdf"], status: "approved" },
  { id: "va-8", name: "Unlicensed Venue", ownerName: "Unknown", city: "Jakarta", courts: 1, submittedAt: "2026-05-05", documents: [], status: "rejected" },
];

export type Transaction = {
  id: string;
  bookingId: string;
  user: string;
  venue: string;
  amount: number;
  commission: number;
  provider: "midtrans" | "xendit";
  paymentStatus: "completed" | "pending" | "failed" | "refunded";
  dateTime: string;
};

export const transactions: Transaction[] = [
  { id: "tx-001", bookingId: "BK-3842", user: "Rina Wijaya", venue: "Padel Bali Arena", amount: 400_000, commission: 40_000, provider: "midtrans", paymentStatus: "completed", dateTime: "2026-05-29 10:30" },
  { id: "tx-002", bookingId: "BK-3841", user: "Dimas Putra", venue: "Jakarta Padel Club", amount: 500_000, commission: 50_000, provider: "xendit", paymentStatus: "completed", dateTime: "2026-05-29 09:15" },
  { id: "tx-003", bookingId: "BK-3840", user: "Sarah Chen", venue: "Surabaya Padel Center", amount: 350_000, commission: 35_000, provider: "midtrans", paymentStatus: "completed", dateTime: "2026-05-29 08:45" },
  { id: "tx-004", bookingId: "BK-3839", user: "Agus Hermawan", venue: "Padel Bali Arena", amount: 400_000, commission: 40_000, provider: "xendit", paymentStatus: "pending", dateTime: "2026-05-29 08:20" },
  { id: "tx-005", bookingId: "BK-3838", user: "Lisa Tanaka", venue: "Jakarta Padel Club", amount: 600_000, commission: 60_000, provider: "midtrans", paymentStatus: "completed", dateTime: "2026-05-28 18:00" },
  { id: "tx-006", bookingId: "BK-3837", user: "Budi Santoso", venue: "Surabaya Padel Center", amount: 300_000, commission: 30_000, provider: "xendit", paymentStatus: "refunded", dateTime: "2026-05-28 16:30" },
  { id: "tx-007", bookingId: "BK-3836", user: "Maya Putri", venue: "Padel Bali Arena", amount: 450_000, commission: 45_000, provider: "midtrans", paymentStatus: "completed", dateTime: "2026-05-28 14:00" },
  { id: "tx-008", bookingId: "BK-3835", user: "Reza Hakim", venue: "Jakarta Padel Club", amount: 500_000, commission: 50_000, provider: "xendit", paymentStatus: "failed", dateTime: "2026-05-28 12:15" },
  { id: "tx-009", bookingId: "BK-3834", user: "Dewi Lestari", venue: "Padel Bali Arena", amount: 400_000, commission: 40_000, provider: "midtrans", paymentStatus: "completed", dateTime: "2026-05-28 10:00" },
  { id: "tx-010", bookingId: "BK-3833", user: "Tommy Wijaya", venue: "Surabaya Padel Center", amount: 350_000, commission: 35_000, provider: "xendit", paymentStatus: "completed", dateTime: "2026-05-27 17:30" },
];

export type CommissionSetting = {
  venueId: string;
  venueName: string;
  city: string;
  commission: number;
};

export const commissionSettings = {
  defaultCommission: 10,
  perVenue: [
    { venueId: "v-1", venueName: "Padel Bali Arena", city: "Bali", commission: 10 },
    { venueId: "v-2", venueName: "Jakarta Padel Club", city: "Jakarta", commission: 12 },
    { venueId: "v-3", venueName: "Surabaya Padel Center", city: "Surabaya", commission: 8 },
    { venueId: "v-4", venueName: "Seminyak Padel Club", city: "Bali", commission: 10 },
    { venueId: "v-5", venueName: "PIK Padel Arena", city: "Jakarta", commission: 15 },
  ] as CommissionSetting[],
};

export type RefundRequest = {
  id: string;
  bookingId: string;
  user: string;
  venue: string;
  amount: number;
  reason: string;
  bookingDate: string;
  requestDate: string;
  eligible: boolean;
  status: "pending" | "approved" | "rejected";
};

export const refundRequests: RefundRequest[] = [
  { id: "rf-1", bookingId: "BK-3820", user: "Rina Wijaya", venue: "Padel Bali Arena", amount: 400_000, reason: "Schedule conflict — cannot attend", bookingDate: "2026-06-02", requestDate: "2026-05-29", eligible: true, status: "pending" },
  { id: "rf-2", bookingId: "BK-3815", user: "Dimas Putra", venue: "Jakarta Padel Club", amount: 500_000, reason: "Venue cancelled maintenance", bookingDate: "2026-05-30", requestDate: "2026-05-28", eligible: true, status: "pending" },
  { id: "rf-3", bookingId: "BK-3810", user: "Sarah Chen", venue: "Surabaya Padel Center", amount: 350_000, reason: "Double booked by mistake", bookingDate: "2026-05-29", requestDate: "2026-05-28", eligible: false, status: "pending" },
  { id: "rf-4", bookingId: "BK-3805", user: "Agus Hermawan", venue: "Padel Bali Arena", amount: 400_000, reason: "Injury — cannot play", bookingDate: "2026-05-31", requestDate: "2026-05-27", eligible: true, status: "pending" },
  { id: "rf-5", bookingId: "BK-3800", user: "Lisa Tanaka", venue: "Jakarta Padel Club", amount: 600_000, reason: "Weather concerns", bookingDate: "2026-06-01", requestDate: "2026-05-27", eligible: true, status: "pending" },
  { id: "rf-6", bookingId: "BK-3795", user: "Tommy Wijaya", venue: "Surabaya Padel Center", amount: 350_000, reason: "Found better time slot", bookingDate: "2026-05-28", requestDate: "2026-05-27", eligible: false, status: "rejected" },
  { id: "rf-7", bookingId: "BK-3790", user: "Maya Putri", venue: "Padel Bali Arena", amount: 450_000, reason: "Personal emergency", bookingDate: "2026-06-03", requestDate: "2026-05-26", eligible: true, status: "approved" },
];

export type Dispute = {
  id: string;
  user: string;
  venue: string;
  issueType: "court_unavailable" | "facility_mismatch" | "payment_issue" | "safety_concern" | "staff_behavior";
  description: string;
  status: "open" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  assignedTo: string | null;
};

export const disputes: Dispute[] = [
  { id: "dp-1", user: "Rina Wijaya", venue: "Jakarta Padel Club", issueType: "court_unavailable", description: "Court was occupied at booked time, no alternative offered", status: "open", priority: "high", createdAt: "2026-05-28", assignedTo: null },
  { id: "dp-2", user: "Dimas Putra", venue: "Padel Bali Arena", issueType: "facility_mismatch", description: "Lighting was broken, court surface damaged", status: "investigating", priority: "medium", createdAt: "2026-05-26", assignedTo: "Admin Ari" },
  { id: "dp-3", user: "Sarah Chen", venue: "Surabaya Padel Center", issueType: "payment_issue", description: "Charged twice for single booking", status: "open", priority: "critical", createdAt: "2026-05-27", assignedTo: null },
  { id: "dp-4", user: "Agus Hermawan", venue: "Jakarta Padel Club", issueType: "safety_concern", description: "Wet floor near court entrance, slipped during session", status: "investigating", priority: "high", createdAt: "2026-05-25", assignedTo: "Admin Budi" },
];

export const monthlyMetrics = {
  gmv: [
    { month: "Dec", value: 520_000_000 },
    { month: "Jan", value: 580_000_000 },
    { month: "Feb", value: 620_000_000 },
    { month: "Mar", value: 690_000_000 },
    { month: "Apr", value: 760_000_000 },
    { month: "May", value: 847_500_000 },
  ],
  revenue: [
    { month: "Dec", value: 52_000_000 },
    { month: "Jan", value: 58_000_000 },
    { month: "Feb", value: 62_000_000 },
    { month: "Mar", value: 69_000_000 },
    { month: "Apr", value: 76_000_000 },
    { month: "May", value: 84_750_000 },
  ],
  bookings: [
    { month: "Dec", value: 2_100 },
    { month: "Jan", value: 2_450 },
    { month: "Feb", value: 2_800 },
    { month: "Mar", value: 3_150 },
    { month: "Apr", value: 3_520 },
    { month: "May", value: 3_842 },
  ],
  topCities: [
    { city: "Bali", bookings: 1_580, revenue: 35_200_000 },
    { city: "Jakarta", bookings: 1_420, revenue: 32_800_000 },
    { city: "Surabaya", bookings: 842, revenue: 16_750_000 },
  ],
  topVenues: [
    { name: "Padel Bali Arena", city: "Bali", bookings: 680, revenue: 15_200_000 },
    { name: "Jakarta Padel Club", city: "Jakarta", bookings: 620, revenue: 14_800_000 },
    { name: "Surabaya Padel Center", city: "Surabaya", bookings: 480, revenue: 9_600_000 },
    { name: "Seminyak Padel Club", city: "Bali", bookings: 420, revenue: 8_400_000 },
    { name: "PIK Padel Arena", city: "Jakarta", bookings: 380, revenue: 9_500_000 },
  ],
};
