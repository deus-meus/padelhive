export const queryKeys = {
  venues: {
    all: () => ["venues"] as const,
    detail: (id: string) => ["venues", id] as const,
    courts: (id: string) => ["venues", id, "courts"] as const,
    availability: (venueId: string, date: string, courtId: string) => 
      ["venues", venueId, "availability", date, courtId] as const,
  },
  bookings: {
    user: (tab: string) => ["bookings", "user", tab] as const,
    detail: (id: string) => ["bookings", id] as const,
    invites: (id: string) => ["bookings", id, "invites"] as const,
  },
  payments: {
    detail: (id: string) => ["payments", id] as const,
  },
  invites: {
    detail: (token: string) => ["invites", token] as const,
  },
  vouchers: {
    all: () => ["vouchers"] as const,
  }
};
