import { formatBookingDate, formatBookingTimeRange } from "./format";

export interface CalendarBookingData {
  id: string;
  bookingDate: string | Date;
  startsAt: string | Date;
  endsAt: string | Date;
  venue?: {
    name?: string;
    location?: string;
    city?: string;
    googleMapsUrl?: string;
    mapUrl?: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  court?: {
    name?: string;
    type?: string;
  } | null;
}

export function parseDateTime(
  bookingDate: string | Date,
  timeVal: string | Date,
): Date {
  if (timeVal instanceof Date && !Number.isNaN(timeVal.getTime())) {
    return timeVal;
  }

  if (typeof timeVal === "string") {
    if (timeVal.includes("T") || timeVal.includes("Z")) {
      const parsed = new Date(timeVal);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const match = timeVal.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = Number.parseInt(match[1], 10);
      const minutes = Number.parseInt(match[2], 10);

      let baseDate: Date;
      if (bookingDate instanceof Date) {
        baseDate = new Date(bookingDate);
      } else if (typeof bookingDate === "string") {
        baseDate = new Date(bookingDate);
      } else {
        baseDate = new Date();
      }

      if (Number.isNaN(baseDate.getTime())) {
        baseDate = new Date();
      }

      const year = baseDate.getFullYear();
      const month = String(baseDate.getMonth() + 1).padStart(2, "0");
      const day = String(baseDate.getDate()).padStart(2, "0");
      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");

      return new Date(`${year}-${month}-${day}T${hh}:${mm}:00`);
    }

    const fallback = new Date(timeVal);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }
  }

  if (bookingDate instanceof Date) return bookingDate;
  const d = new Date(bookingDate);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function getVenueMapUrl(venue?: CalendarBookingData["venue"]): string {
  if (!venue) return "";
  if (venue.googleMapsUrl) return venue.googleMapsUrl;
  if (venue.mapUrl) return venue.mapUrl;
  if (venue.latitude != null && venue.longitude != null) {
    return `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`;
  }
  const locationString = [venue.name, venue.location, venue.city]
    .filter(Boolean)
    .join(", ");
  return locationString
    ? `https://maps.google.com/?q=${encodeURIComponent(locationString)}`
    : "";
}

export function getGoogleCalendarUrl(booking: CalendarBookingData): string {
  const startDate = parseDateTime(booking.bookingDate, booking.startsAt);
  const endDate = parseDateTime(booking.bookingDate, booking.endsAt);

  const startIso = formatICalDate(startDate);
  const endIso = formatICalDate(endDate);

  const venueName = booking.venue?.name || "Padel Court";
  const courtName = booking.court?.name ? ` (${booking.court.name})` : "";
  const title = `Padel Match - ${venueName}${courtName}`;

  const locationParts = [
    booking.venue?.name,
    booking.venue?.location,
    booking.venue?.city,
  ].filter(Boolean);
  const location = locationParts.join(", ");

  const detailsParts = [
    "Padel Match Reservation",
    `Booking Reference: #${booking.id}`,
    booking.venue?.name ? `Venue: ${booking.venue.name}` : null,
    booking.court?.name ? `Court: ${booking.court.name}` : null,
  ].filter(Boolean);
  const details = detailsParts.join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startIso}/${endIso}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(booking: CalendarBookingData): string {
  const startDate = parseDateTime(booking.bookingDate, booking.startsAt);
  const endDate = parseDateTime(booking.bookingDate, booking.endsAt);

  const startIso = formatICalDate(startDate);
  const endIso = formatICalDate(endDate);
  const nowIso = formatICalDate(new Date());

  const venueName = booking.venue?.name || "Padel Court";
  const courtName = booking.court?.name ? ` (${booking.court.name})` : "";
  const title = `Padel Match - ${venueName}${courtName}`;

  const locationParts = [
    booking.venue?.name,
    booking.venue?.location,
    booking.venue?.city,
  ].filter(Boolean);
  const location = locationParts.join(", ");

  const detailsLines = [
    "Padel Match Reservation",
    `Booking Reference: #${booking.id}`,
    booking.venue?.name ? `Venue: ${booking.venue.name}` : null,
    booking.court?.name ? `Court: ${booking.court.name}` : null,
  ].filter(Boolean);
  const description = detailsLines.join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PadelHive//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@padelhive.com`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(booking: CalendarBookingData): void {
  const content = generateIcsContent(booking);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `padel-match-${booking.id.slice(0, 8)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getWhatsAppShareUrl(booking: CalendarBookingData): string {
  const venueName = booking.venue?.name || "Padel Court";
  const courtName = booking.court?.name || "Court";
  const dateStr = formatBookingDate(booking.bookingDate);
  const timeStr = formatBookingTimeRange(booking.startsAt, booking.endsAt);
  const mapUrl = getVenueMapUrl(booking.venue);

  const lines = [
    "🎾 *Padel Match Summary*",
    "",
    `📍 *Venue:* ${venueName}`,
    `🏟️ *Court:* ${courtName}`,
    `📅 *Date:* ${dateStr}`,
    `⏰ *Time:* ${timeStr}`,
  ];

  if (mapUrl) {
    lines.push(`🗺️ *Map:* ${mapUrl}`);
  }

  lines.push("", `Booking ID: #${booking.id.slice(-6).toUpperCase()}`);

  const message = lines.join("\n");
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
