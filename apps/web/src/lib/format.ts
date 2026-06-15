const TIMEZONE = "Asia/Jakarta";

export function formatBookingDate(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatBookingTime(value: string | Date | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) {
    return `${value} WIB`;
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d) + " WIB";
}

export function formatBookingTimeRange(start: string | Date | undefined | null, end: string | Date | undefined | null): string {
  if (!start || !end) return "";
  
  const formatSingle = (val: string | Date): string | null => {
    if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) {
      return val;
    }
    const d = typeof val === "string" ? new Date(val) : val;
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const sStr = formatSingle(start);
  const eStr = formatSingle(end);
  if (!sStr || !eStr) return "";

  return `${sStr} – ${eStr} WIB`;
}

export function formatBookingDateTime(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateFmt.format(d)}, ${timeFmt.format(d)} WIB`;
}

export function formatShortDate(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatShortWeekday(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(d);
}

export function formatDayNumber(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    day: "numeric",
  }).format(d);
}
