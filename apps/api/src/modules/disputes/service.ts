import {
  type Dispute,
  DisputeIssueType,
  DisputePriority,
  DisputeStatus,
  NotificationType,
  UserRole,
} from "@prisma/client";
import { BadRequestException, NotFoundException } from "../../common/errors";
import {
  prisma as defaultPrisma,
  type PrismaService,
} from "../../common/prisma";
import {
  type CreateNotificationInput,
  notificationsService as defaultNotifications,
  type NotificationsService,
} from "../notifications/service";
import type { CreateDisputeInput } from "./model";

export class DisputesService {
  constructor(
    private prisma: PrismaService = defaultPrisma,
    private readonly notifications: NotificationsService = defaultNotifications,
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      console.warn(
        `[DisputesService] Failed to emit notification: ${String(err)}`,
      );
    }
  }

  private toResponse(
    dispute: Dispute & {
      venue: { id: string; name: string };
      raisedBy: { id: string; name: string };
      assignedTo: { id: string; name: string } | null;
    },
  ) {
    return {
      id: dispute.id,
      bookingId: dispute.bookingId,
      issueType: dispute.issueType,
      description: dispute.description,
      status: dispute.status,
      priority: dispute.priority,
      resolutionNotes: dispute.resolutionNotes,
      resolvedAt: dispute.resolvedAt,
      createdAt: dispute.createdAt,
      user: { id: dispute.raisedBy.id, name: dispute.raisedBy.name },
      venue: { id: dispute.venue.id, name: dispute.venue.name },
      assignedTo: dispute.assignedTo
        ? { id: dispute.assignedTo.id, name: dispute.assignedTo.name }
        : null,
    };
  }

  private readonly include = {
    venue: { select: { id: true, name: true } },
    raisedBy: { select: { id: true, name: true } },
    assignedTo: { select: { id: true, name: true } },
  };

  async createDispute(userId: string, dto: CreateDisputeInput) {
    if (!dto.bookingId || dto.bookingId.trim() === "") {
      throw new BadRequestException("bookingId is required");
    }
    if (!dto.description || dto.description.trim() === "") {
      throw new BadRequestException("Description is required");
    }
    if (!Object.values(DisputeIssueType).includes(dto.issueType)) {
      throw new BadRequestException(`Invalid issue type: ${dto.issueType}`);
    }
    const priority =
      dto.priority && Object.values(DisputePriority).includes(dto.priority)
        ? dto.priority
        : DisputePriority.MEDIUM;

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: { venueId: true, hostUserId: true },
    });

    if (!booking || booking.hostUserId !== userId) {
      throw new NotFoundException("Booking not found or not owned by user");
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        bookingId: dto.bookingId,
        venueId: booking.venueId,
        raisedByUserId: userId,
        issueType: dto.issueType,
        description: dto.description,
        priority: priority,
        status: DisputeStatus.OPEN,
        events: {
          create: {
            toStatus: DisputeStatus.OPEN,
            actorUserId: userId,
          },
        },
      },
      include: this.include,
    });

    await this.safeNotify({
      userId: userId,
      type: NotificationType.DISPUTE_CREATED,
      title: "Dispute submitted",
      body: "We received your report and will look into it.",
      linkUrl: `/bookings?tab=disputes`,
    });

    const superAdmins = await this.prisma.user.findMany({
      where: { role: UserRole.SUPER_ADMIN },
      select: { id: true },
    });
    await Promise.all(
      superAdmins
        .filter((a) => a.id !== userId)
        .map((a) =>
          this.safeNotify({
            userId: a.id,
            type: NotificationType.DISPUTE_CREATED,
            title: "New dispute reported",
            body: "A player reported an issue on a booking.",
            linkUrl: `/admin/disputes`,
          }),
        ),
    );

    return this.toResponse(dispute);
  }

  async findMyDisputes(userId: string) {
    const disputes = await this.prisma.dispute.findMany({
      where: { raisedByUserId: userId },
      include: this.include,
      orderBy: { createdAt: "desc" },
    });
    return disputes.map((d) => this.toResponse(d));
  }

  async findAllForAdmin(status?: DisputeStatus) {
    const disputes = await this.prisma.dispute.findMany({
      where: status ? { status } : undefined,
      include: this.include,
      orderBy: { createdAt: "desc" },
    });
    return disputes.map((d) => this.toResponse(d));
  }

  async assignDispute(id: string, adminUserId: string) {
    const existing = await this.prisma.dispute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Dispute not found");

    if (
      existing.status === DisputeStatus.RESOLVED ||
      existing.status === DisputeStatus.CLOSED
    ) {
      throw new BadRequestException(
        `Cannot assign a ${existing.status} dispute`,
      );
    }

    const dispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.INVESTIGATING,
        assignedToUserId: adminUserId,
        events: {
          create: {
            fromStatus: existing.status,
            toStatus: DisputeStatus.INVESTIGATING,
            actorUserId: adminUserId,
          },
        },
      },
      include: this.include,
    });

    await this.safeNotify({
      userId: dispute.raisedByUserId,
      type: NotificationType.DISPUTE_ASSIGNED,
      title: "Dispute under investigation",
      body: "Your report is now being investigated.",
      linkUrl: `/bookings?tab=disputes`,
    });

    return this.toResponse(dispute);
  }

  async resolveDispute(
    id: string,
    adminUserId: string,
    resolutionNotes?: string,
  ) {
    const existing = await this.prisma.dispute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Dispute not found");

    if (
      existing.status === DisputeStatus.RESOLVED ||
      existing.status === DisputeStatus.CLOSED
    ) {
      throw new BadRequestException(
        `Cannot resolve a ${existing.status} dispute`,
      );
    }

    const dispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes ?? existing.resolutionNotes,
        events: {
          create: {
            fromStatus: existing.status,
            toStatus: DisputeStatus.RESOLVED,
            actorUserId: adminUserId,
            notes: resolutionNotes,
          },
        },
      },
      include: this.include,
    });

    await this.safeNotify({
      userId: dispute.raisedByUserId,
      type: NotificationType.DISPUTE_RESOLVED,
      title: "Dispute resolved",
      body: "Your report has been resolved.",
      linkUrl: `/bookings?tab=disputes`,
    });

    return this.toResponse(dispute);
  }

  async closeDispute(id: string, adminUserId: string) {
    const existing = await this.prisma.dispute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Dispute not found");

    if (existing.status === DisputeStatus.CLOSED) {
      throw new BadRequestException("Dispute already closed");
    }

    const dispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.CLOSED,
        closedAt: new Date(),
        events: {
          create: {
            fromStatus: existing.status,
            toStatus: DisputeStatus.CLOSED,
            actorUserId: adminUserId,
          },
        },
      },
      include: this.include,
    });

    await this.safeNotify({
      userId: dispute.raisedByUserId,
      type: NotificationType.DISPUTE_CLOSED,
      title: "Dispute closed",
      body: "Your report has been closed.",
      linkUrl: `/bookings?tab=disputes`,
    });

    return this.toResponse(dispute);
  }
}

export const disputesService = new DisputesService();
