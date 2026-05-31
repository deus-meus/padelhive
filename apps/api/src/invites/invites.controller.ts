import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";
import { CreateInviteDto } from "./dto/create-invite.dto";
import { InviteResponseDto } from "./dto/invite-response.dto";
import { RsvpInviteDto } from "./dto/rsvp-invite.dto";
import { InvitesService } from "./invites.service";

@ApiTags("invites")
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post("bookings/:bookingId/invites")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or reuse an invite for a booking" })
  @ApiCreatedResponse({ type: InviteResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiBadRequestResponse({ description: "Invalid invite request" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  create(@Param("bookingId") bookingId: string, @Body() body: CreateInviteDto, @CurrentUser() user: RequestUser) {
    return this.invitesService.createInviteForBooking(user.id, bookingId, body);
  }

  @Get("bookings/:bookingId/invites")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List invites for current user's booking" })
  @ApiOkResponse({ type: InviteResponseDto, isArray: true })
  list(@Param("bookingId") bookingId: string, @CurrentUser() user: RequestUser) {
    return this.invitesService.listInvitesForBooking(user.id, bookingId);
  }

  @Patch("invites/:token/rsvp")
  @ApiOperation({ summary: "RSVP to an invite by public token" })
  @ApiOkResponse({ type: InviteResponseDto })
  @ApiBadRequestResponse({ description: "Invalid RSVP status" })
  @ApiNotFoundResponse({ description: "Invite not found" })
  rsvp(@Param("token") token: string, @Body() body: RsvpInviteDto) {
    return this.invitesService.rsvpByToken(token, body);
  }
}
