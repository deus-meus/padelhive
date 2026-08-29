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

export type CreateDisputeInput = Static<typeof CreateDisputeSchema>;
export type ResolveDisputeInput = Static<typeof ResolveDisputeSchema>;
export type DisputeQueryInput = Static<typeof DisputeQuerySchema>;
