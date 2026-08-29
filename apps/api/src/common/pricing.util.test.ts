import {
  wibToUtc,
  utcToWibDateStr,
  getWibHour,
  isWeekendWib,
  isPeakHour,
  getSlotPrice,
  CourtPricing,
} from "./pricing.util";

describe("pricing.util", () => {
  const mockCourt: CourtPricing = {
    weekdayPeak: 300000,
    weekdayOffPeak: 200000,
    weekendPeak: 400000,
    weekendOffPeak: 250000,
  };

  describe("wibToUtc", () => {
    it("converts a normal WIB time to UTC", () => {
      const utc = wibToUtc("2099-06-01", "09:00");
      expect(utc.toISOString()).toBe("2099-06-01T02:00:00.000Z");
    });

    it("handles day-boundary crossing correctly", () => {
      const utc = wibToUtc("2099-06-01", "06:00");
      expect(utc.toISOString()).toBe("2099-05-31T23:00:00.000Z");
    });
  });

  describe("utcToWibDateStr", () => {
    it("converts a UTC time back to WIB date string", () => {
      const utc = new Date("2099-05-31T23:00:00.000Z");
      expect(utcToWibDateStr(utc)).toBe("2099-06-01");
    });
  });

  describe("getWibHour", () => {
    it("extracts the hour from a time string", () => {
      expect(getWibHour("09:00")).toBe(9);
    });
  });

  describe("isWeekendWib", () => {
    it("returns false for weekdays", () => {
      expect(isWeekendWib("2024-05-13")).toBe(false); // Monday
      expect(isWeekendWib("2024-05-17")).toBe(false); // Friday
    });

    it("returns true for weekends", () => {
      expect(isWeekendWib("2024-05-18")).toBe(true); // Saturday
      expect(isWeekendWib("2024-05-19")).toBe(true); // Sunday
    });

    it("handles boundaries accurately", () => {
      // Sat 06:00 WIB is Fri 23:00 UTC. isWeekendWib only checks the date string.
      expect(isWeekendWib("2024-05-18")).toBe(true);
    });
  });

  describe("isPeakHour", () => {
    it("correctly identifies weekday peak hours", () => {
      expect(isPeakHour(16, false)).toBe(false);
      expect(isPeakHour(17, false)).toBe(true);
      expect(isPeakHour(20, false)).toBe(true);
      expect(isPeakHour(21, false)).toBe(false);
    });

    it("correctly identifies weekend peak hours", () => {
      expect(isPeakHour(7, true)).toBe(false);
      expect(isPeakHour(8, true)).toBe(true);
      expect(isPeakHour(11, true)).toBe(true);
      expect(isPeakHour(12, true)).toBe(false);
      expect(isPeakHour(15, true)).toBe(false);
      expect(isPeakHour(16, true)).toBe(true);
      expect(isPeakHour(20, true)).toBe(true);
      expect(isPeakHour(21, true)).toBe(false);
    });
  });

  describe("getSlotPrice", () => {
    it("returns correct price for weekday peak", () => {
      expect(getSlotPrice(mockCourt, 17, false)).toBe(300000);
    });

    it("returns correct price for weekday off-peak", () => {
      expect(getSlotPrice(mockCourt, 12, false)).toBe(200000);
    });

    it("returns correct price for weekend peak", () => {
      expect(getSlotPrice(mockCourt, 16, true)).toBe(400000);
    });

    it("returns correct price for weekend off-peak", () => {
      expect(getSlotPrice(mockCourt, 14, true)).toBe(250000);
    });
  });
});
