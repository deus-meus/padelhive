import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewResponseDto } from "./dto/review-response.dto";

type ReviewWithAuthor = Prisma.ReviewGetPayload<{ include: { author: { select: { name: true; avatarUrl: true } } } }>;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const rating = Number(dto.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be an integer between 1 and 5");
    }
    const comment = dto.comment?.trim() || null;
    if (comment && comment.length > 1000) {
      throw new BadRequestException("Comment must be 1000 characters or fewer");
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: { id: true, venueId: true, hostUserId: true, status: true },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.hostUserId !== userId) {
      throw new ForbiddenException("Only the booking host can review this booking");
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException("Only completed bookings can be reviewed");
    }

    const existing = await this.prisma.review.findUnique({ where: { bookingId: booking.id }, select: { id: true } });
    if (existing) {
      throw new ConflictException("This booking has already been reviewed");
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          venueId: booking.venueId,
          bookingId: booking.id,
          authorId: userId,
          rating,
          comment,
        },
        include: { author: { select: { name: true, avatarUrl: true } } },
      });

      const agg = await tx.review.aggregate({
        where: { venueId: booking.venueId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.venue.update({
        where: { id: booking.venueId },
        data: {
          rating: Number((agg._avg.rating ?? 0).toFixed(2)),
          reviewCount: agg._count._all,
        },
      });

      return created;
    });

    return this.toResponse(review);
  }

  async findVenueReviews(venueId: string): Promise<ReviewResponseDto[]> {
    if (!venueId) {
      throw new BadRequestException("venueId is required");
    }
    const reviews = await this.prisma.review.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, avatarUrl: true } } },
    });
    return reviews.map((r) => this.toResponse(r));
  }

  private toResponse(review: ReviewWithAuthor): ReviewResponseDto {
    return {
      id: review.id,
      venueId: review.venueId,
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment,
      authorId: review.authorId,
      authorName: review.author.name,
      authorAvatarUrl: review.author.avatarUrl,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
