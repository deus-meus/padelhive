import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDisputeDto } from "./dto/create-dispute.dto";
import { DisputeResponseDto } from "./dto/dispute-response.dto";
import { DisputeStatus, DisputeIssueType, DisputePriority, Dispute } from "@prisma/client";

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  private toResponse(
    dispute: Dispute & {
      venue: { id: string; name: string };
      raisedBy: { id: string; name: string };
      assignedTo: { id: string; name: string } | null;
    }
  ): DisputeResponseDto {
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
      assignedTo: dispute.assignedTo ? { id: dispute.assignedTo.id, name: dispute.assignedTo.name } : null,
    };
  }

  private readonly include = {
    venue: { select: { id: true, name: true } },
    raisedBy: { select: { id: true, name: true } },
    assignedTo: { select: { id: true, name: true } },
  };

  async createDispute(userId: string, dto: CreateDisputeDto): Promise<DisputeResponseDto> {
    if (!dto.description || dto.description.trim() === "") {
      throw new BadRequestException("Description is required");
    }
    if (!Object.values(DisputeIssueType).includes(dto.issueType)) {
      throw new BadRequestException(`Invalid issue type: ${dto.issueType}`);
    }
    const priority = dto.priority && Object.values(DisputePriority).includes(dto.priority) ? dto.priority : DisputePriority.MEDIUM;

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

    return this.toResponse(dispute);
  }

  async findMyDisputes(userId: string): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: { raisedByUserId: userId },
      include: this.include,
      orderBy: { createdAt: "desc" },
    });
    return disputes.map((d) => this.toResponse(d));
  }

  async findAllForAdmin(status?: DisputeStatus): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: status ? { status } : undefined,
      include: this.include,
      orderBy: { createdAt: "desc" },
    });
    return disputes.map((d) => this.toResponse(d));
  }

  async assignDispute(id: string, adminUserId: string): Promise<DisputeResponseDto> {
    const existing = await this.prisma.dispute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Dispute not found");

    if (existing.status === DisputeStatus.RESOLVED || existing.status === DisputeStatus.CLOSED) {
      throw new BadRequestException(`Cannot assign a ${existing.status} dispute`);
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

    return this.toResponse(dispute);
  }

  async resolveDispute(id: string, adminUserId: string, resolutionNotes?: string): Promise<DisputeResponseDto> {
    const existing = await this.prisma.dispute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Dispute not found");

    if (existing.status === DisputeStatus.RESOLVED || existing.status === DisputeStatus.CLOSED) {
      throw new BadRequestException(`Cannot resolve a ${existing.status} dispute`);
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

    return this.toResponse(dispute);
  }

  async closeDispute(id: string, adminUserId: string): Promise<DisputeResponseDto> {
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

    return this.toResponse(dispute);
  }
}
