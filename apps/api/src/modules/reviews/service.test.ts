import { describe, expect, it, mock } from "bun:test";
import { BookingStatus } from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../common/errors";
import { ReviewsService } from "./service";

describe("ReviewsService", () => {
  const mockBooking = {
    id: "booking-1",
    venueId: "venue-1",
    hostUserId: "user-1",
    status: BookingStatus.COMPLETED,
  };

  const mockReview = {
    id: "review-1",
    venueId: "venue-1",
    bookingId: "booking-1",
    authorId: "user-1",
    rating: 5,
    comment: "Great court!",
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    author: {
      name: "Player One",
      avatarUrl: "http://example.com/avatar.png",
    },
  };

  describe("createReview", () => {
    it("throws BadRequestException if rating is invalid", async () => {
      const service = new ReviewsService({} as never);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 0 }),
      ).rejects.toThrow(BadRequestException);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 6 }),
      ).rejects.toThrow(BadRequestException);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 4.5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException if comment exceeds 1000 characters", async () => {
      const service = new ReviewsService({} as never);
      const longComment = "a".repeat(1001);
      expect(
        service.createReview("user-1", {
          bookingId: "b-1",
          rating: 5,
          comment: longComment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws NotFoundException if booking is not found", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(null),
        },
      };
      const service = new ReviewsService(mockPrisma as never);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException if user is not the booking host", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(mockBooking),
        },
      };
      const service = new ReviewsService(mockPrisma as never);
      expect(
        service.createReview("other-user", { bookingId: "b-1", rating: 5 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws BadRequestException if booking status is not COMPLETED", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue({
            ...mockBooking,
            status: BookingStatus.CONFIRMED,
          }),
        },
      };
      const service = new ReviewsService(mockPrisma as never);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws ConflictException if review already exists for booking", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(mockBooking),
        },
        review: {
          findUnique: mock().mockResolvedValue({ id: "existing-review" }),
        },
      };
      const service = new ReviewsService(mockPrisma as never);
      expect(
        service.createReview("user-1", { bookingId: "b-1", rating: 5 }),
      ).rejects.toThrow(ConflictException);
    });

    it("creates review and updates venue rating successfully", async () => {
      const txMock = {
        review: {
          create: mock().mockResolvedValue(mockReview),
          aggregate: mock().mockResolvedValue({
            _avg: { rating: 5 },
            _count: { _all: 1 },
          }),
        },
        venue: {
          update: mock().mockResolvedValue({}),
        },
      };

      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue(mockBooking),
        },
        review: {
          findUnique: mock().mockResolvedValue(null),
        },
        $transaction: mock().mockImplementation(
          (cb: (tx: unknown) => unknown) => cb(txMock),
        ),
      };

      const service = new ReviewsService(mockPrisma as never);
      const result = await service.createReview("user-1", {
        bookingId: "booking-1",
        rating: 5,
        comment: "Great court!",
      });

      expect(result).toEqual({
        id: "review-1",
        venueId: "venue-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great court!",
        authorId: "user-1",
        authorName: "Player One",
        authorAvatarUrl: "http://example.com/avatar.png",
        createdAt: "2026-09-01T00:00:00.000Z",
      });
      expect(txMock.venue.update).toHaveBeenCalledWith({
        where: { id: "venue-1" },
        data: { rating: 5, reviewCount: 1 },
      });
    });
  });

  describe("findVenueReviews", () => {
    it("throws BadRequestException if venueId is empty", async () => {
      const service = new ReviewsService({} as never);
      expect(service.findVenueReviews("")).rejects.toThrow(BadRequestException);
    });

    it("returns mapped reviews for a venue", async () => {
      const mockPrisma = {
        review: {
          findMany: mock().mockResolvedValue([mockReview]),
        },
      };
      const service = new ReviewsService(mockPrisma as never);
      const result = await service.findVenueReviews("venue-1");

      expect(result).toHaveLength(1);
      expect(result[0].authorName).toBe("Player One");
    });
  });
});
