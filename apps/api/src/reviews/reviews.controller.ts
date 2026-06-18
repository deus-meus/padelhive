import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewResponseDto } from "./dto/review-response.dto";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "List reviews for a venue" })
  @ApiQuery({ name: "venueId", required: true })
  @ApiOkResponse({ type: ReviewResponseDto, isArray: true })
  @ApiBadRequestResponse({ description: "venueId is required" })
  findVenueReviews(@Query("venueId") venueId: string): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findVenueReviews(venueId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a review for a completed booking" })
  @ApiCreatedResponse({ type: ReviewResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiBadRequestResponse({ description: "Invalid review request" })
  @ApiForbiddenResponse({ description: "Only the booking host can review this booking" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  @ApiConflictResponse({ description: "This booking has already been reviewed" })
  create(@Body() body: CreateReviewDto, @CurrentUser() user: RequestUser): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(user.id, body);
  }
}
