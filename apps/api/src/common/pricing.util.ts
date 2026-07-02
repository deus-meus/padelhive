export const WIB_OFFSET_HOURS = 7;

export type CourtPricing = {
  weekdayPeak: number;
  weekdayOffPeak: number;
  weekendPeak: number;
  weekendOffPeak: number;
};

export function wibToUtc(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  
  return new Date(Date.UTC(year, month - 1, day, hour - WIB_OFFSET_HOURS, minute, 0, 0));
}

export function utcToWibDateStr(utcDate: Date): string {
  const wibDate = new Date(utcDate.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);
  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWibHour(timeStr: string): number {
  return parseInt(timeStr.split(":")[0], 10);
}

export function isWeekendWib(dateStr: string): boolean {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function isPeakHour(hour: number, isWeekend: boolean): boolean {
  if (isWeekend) {
    return (hour >= 8 && hour < 12) || (hour >= 16 && hour < 21);
  }
  return hour >= 17 && hour < 21;
}

export function getSlotPrice(court: CourtPricing, hour: number, isWeekend: boolean): number {
  const peak = isPeakHour(hour, isWeekend);

  if (isWeekend) {
    return peak ? court.weekendPeak : court.weekendOffPeak;
  }

  return peak ? court.weekdayPeak : court.weekdayOffPeak;
}

export function wibHourFromUtc(utc: Date): number {
  return (utc.getUTCHours() + WIB_OFFSET_HOURS) % 24;
}

export function parseHour(timeStr: string): number {
  return parseInt(timeStr.split(":")[0], 10);
}

export function isOvernight(openHour: number, closeHour: number): boolean {
  return closeHour <= openHour;
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const newYear = date.getUTCFullYear();
  const newMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const newDay = String(date.getUTCDate()).padStart(2, "0");
  return `${newYear}-${newMonth}-${newDay}`;
}

export function resolveSlotUtc(dateStr: string, clockHour: number, openHour: number, overnight: boolean): Date {
  const offset = (overnight && clockHour < openHour) ? 1 : 0;
  return wibToUtc(addDaysToDateStr(dateStr, offset), String(clockHour).padStart(2, "0") + ":00");
}
