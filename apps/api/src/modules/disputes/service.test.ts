import { describe, expect, it, mock } from "bun:test";
import {
  DisputeIssueType,
  DisputePriority,
  DisputeStatus,
} from "@prisma/client";
import { BadRequestException, NotFoundException } from "../../common/errors";
import { DisputesService } from "./service";

describe("DisputesService", () => {
  const mockBooking = {
    id: "booking-1",
    venueId: "venue-1",
    hostUserId: "user-1",
  };

  const mockDispute = {
    id: "dispute-1",
    bookingId: "booking-1",
    venueId: "venue-1",
    raisedByUserId: "user-1",
    issueType: DisputeIssueType.COURT_UNAVAILABLE,
    description: "Court was locked",
    status: DisputeStatus.OPEN,
    priority: DisputePriority.MEDIUM,
    resolutionNotes: null,
    resolvedAt: null,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    venue: { id: "venue-1", name: "Padel Center" },
    raisedBy: { id: "user-1", name: "Player One" },
    assignedTo: null,
  };

  const mockNotifications = {
    createNotification: mock().mockResolvedValue({}),
  };

  describe("createDispute", () => {
    it("throws BadRequestException if bookingId or description is empty", async () => {
      const service = new DisputesService(
        {} as never,
        mockNotifications as never,
      );
      expect(
        service.createDispute("user-1", {
          bookingId: "",
          description: "Help",
          issueType: DisputeIssueType.SAFETY_CONCERN,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(
        service.createDispute("user-1", {
          bookingId: "booking-1",
          description: " ",
          issueType: DisputeIssueType.SAFETY_CONCERN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException if issueType is invalid", async () => {
      const service = new DisputesService(
        {} as never,
        mockNotifications as never,
      );
      expect(
        service.createDispute("user-1", {
          bookingId: "booking-1",
          description: "Issue description",
          issueType: "INVALID_TYPE" as never,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws NotFoundException if booking not found or not owned by user", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(null),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );
      expect(
        service.createDispute("user-1", {
          bookingId: "booking-1",
          description: "Court closed",
          issueType: DisputeIssueType.COURT_UNAVAILABLE,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("creates dispute and notifies super admins", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(mockBooking),
        },
        dispute: {
          create: mock().mockResolvedValue(mockDispute),
        },
        user: {
          findMany: mock().mockResolvedValue([{ id: "admin-99" }]),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );

      const result = await service.createDispute("user-1", {
        bookingId: "booking-1",
        description: "Court locked",
        issueType: DisputeIssueType.COURT_UNAVAILABLE,
      });

      expect(result).toEqual({
        id: "dispute-1",
        bookingId: "booking-1",
        issueType: DisputeIssueType.COURT_UNAVAILABLE,
        description: "Court was locked",
        status: DisputeStatus.OPEN,
        priority: DisputePriority.MEDIUM,
        resolutionNotes: null,
        resolvedAt: null,
        createdAt: new Date("2026-09-01T00:00:00.000Z"),
        user: { id: "user-1", name: "Player One" },
        venue: { id: "venue-1", name: "Padel Center" },
        assignedTo: null,
      });
      expect(mockNotifications.createNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe("assignDispute", () => {
    it("throws NotFoundException if dispute does not exist", async () => {
      const mockPrisma = {
        dispute: {
          findUnique: mock().mockResolvedValue(null),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );
      expect(service.assignDispute("d-999", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws BadRequestException if dispute is already RESOLVED", async () => {
      const mockPrisma = {
        dispute: {
          findUnique: mock().mockResolvedValue({
            ...mockDispute,
            status: DisputeStatus.RESOLVED,
          }),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );
      expect(service.assignDispute("dispute-1", "admin-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("assigns dispute and sets status to INVESTIGATING", async () => {
      const updatedDispute = {
        ...mockDispute,
        status: DisputeStatus.INVESTIGATING,
        assignedTo: { id: "admin-1", name: "Admin One" },
      };
      const mockPrisma = {
        dispute: {
          findUnique: mock().mockResolvedValue(mockDispute),
          update: mock().mockResolvedValue(updatedDispute),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );

      const result = await service.assignDispute("dispute-1", "admin-1");
      expect(result.status).toBe(DisputeStatus.INVESTIGATING);
      expect(result.assignedTo).toEqual({ id: "admin-1", name: "Admin One" });
    });
  });

  describe("resolveDispute", () => {
    it("resolves dispute with notes", async () => {
      const resolvedDispute = {
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        resolutionNotes: "Refund processed",
        resolvedAt: new Date("2026-09-02T00:00:00.000Z"),
      };
      const mockPrisma = {
        dispute: {
          findUnique: mock().mockResolvedValue(mockDispute),
          update: mock().mockResolvedValue(resolvedDispute),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );

      const result = await service.resolveDispute(
        "dispute-1",
        "admin-1",
        "Refund processed",
      );
      expect(result.status).toBe(DisputeStatus.RESOLVED);
      expect(result.resolutionNotes).toBe("Refund processed");
    });
  });

  describe("closeDispute", () => {
    it("closes dispute successfully", async () => {
      const closedDispute = {
        ...mockDispute,
        status: DisputeStatus.CLOSED,
      };
      const mockPrisma = {
        dispute: {
          findUnique: mock().mockResolvedValue(mockDispute),
          update: mock().mockResolvedValue(closedDispute),
        },
      };
      const service = new DisputesService(
        mockPrisma as never,
        mockNotifications as never,
      );

      const result = await service.closeDispute("dispute-1", "admin-1");
      expect(result.status).toBe(DisputeStatus.CLOSED);
    });
  });
});
