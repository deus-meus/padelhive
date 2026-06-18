export const queryKeys = {
  venues: {
    all: () => ["venues"] as const,
    manage: () => ["venues", "manage"] as const,
    detail: (id: string) => ["venues", id] as const,
    courts: (id: string) => ["venues", id, "courts"] as const,
    courtsManage: (id: string) => ["venues", id, "courts", "manage"] as const,
    availability: (venueId: string, date: string, courtId: string) => 
      ["venues", venueId, "availability", date, courtId] as const,
  },
  reviews: {
    venue: (venueId: string) => ["reviews", venueId] as const,
  },
  bookings: {
    user: (tab: string) => ["bookings", "user", tab] as const,
    detail: (id: string) => ["bookings", id] as const,
    invites: (id: string) => ["bookings", id, "invites"] as const,
    split: (id: string) => ["bookings", id, "split"] as const,
  },
  admin: {
    overview: () => ["admin", "overview"] as const,
    vouchers: () => ["admin", "vouchers"] as const,
    venues: (status?: string) => ["admin", "venues", status ?? "all"] as const,
    disputes: (status?: string) => ["admin", "disputes", status ?? "all"] as const,
    bookings: (params: { status?: string; page?: number }) =>
      ["admin", "bookings", params.status ?? "all", params.page ?? 1] as const,
    commission: (params?: { fromDate?: string; toDate?: string }) => 
      ["admin", "commission", params?.fromDate ?? "all", params?.toDate ?? "all"] as const,
    metrics: () => ["admin", "metrics"] as const,
  },
  dashboard: {
    owner: () => ["dashboard", "owner"] as const,
    revenue: () => ["dashboard", "revenue"] as const,
  },
  payments: {
    detail: (id: string) => ["payments", id] as const,
  },
  invites: {
    detail: (token: string) => ["invites", token] as const,
  },
  vouchers: {
    all: () => ["vouchers"] as const,
  },
  refunds: {
    all: ["refunds"] as const,
    list: (status?: string) => ["refunds", "list", { status }] as const,
    detail: (id: string) => ["refunds", "detail", id] as const,
    history: (id: string) => ["refunds", "detail", id, "history"] as const,
    me: ["refunds", "me"] as const,
  },
  disputes: {
    me: ["disputes", "me"] as const,
  },
};
