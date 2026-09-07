import {
  DisputeIssueType,
  DisputePriority,
  DisputeStatus,
} from "@prisma/client";
import { type Static, t } from "elysia";

export const DisputeIssueTypeEnum = t.Enum(DisputeIssueType);
export const DisputePriorityEnum = t.Enum(DisputePriority);
export const DisputeStatusEnum = t.Enum(DisputeStatus);

export const CreateDisputeSchema = t.Object({
  bookingId: t.String(),
  issueType: DisputeIssueTypeEnum,
  description: t.String(),
  priority: t.Optional(DisputePriorityEnum),
});

export const ResolveDisputeSchema = t.Object({
  resolutionNotes: t.Optional(t.String()),
});

export const DisputeQuerySchema = t.Object({
  status: t.Optional(DisputeStatusEnum),
});

export const DisputeResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    bookingId: t.Optional(t.Nullable(t.String())),
    userId: t.Optional(t.String()),
    assignedAdminId: t.Optional(t.Nullable(t.String())),
    issueType: t.Optional(DisputeIssueTypeEnum),
    priority: t.Optional(DisputePriorityEnum),
    status: t.Optional(DisputeStatusEnum),
    description: t.Optional(t.String()),
    resolutionNotes: t.Optional(t.Nullable(t.String())),
    booking: t.Optional(t.Any()),
    user: t.Optional(t.Any()),
    assignedTo: t.Optional(t.Any()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type CreateDisputeInput = Static<typeof CreateDisputeSchema>;
export type ResolveDisputeInput = Static<typeof ResolveDisputeSchema>;
export type DisputeQueryInput = Static<typeof DisputeQuerySchema>;
