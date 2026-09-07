import { CourtType } from "@prisma/client";
import { type Static, t } from "elysia";

export const CourtTypeEnum = t.Enum(CourtType);

export const CreateCourtSchema = t.Object({
  name: t.String(),
  type: CourtTypeEnum,
  weekdayPeak: t.Number({ minimum: 0 }),
  weekdayOffPeak: t.Number({ minimum: 0 }),
  weekendPeak: t.Number({ minimum: 0 }),
  weekendOffPeak: t.Number({ minimum: 0 }),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateCourtSchema = t.Partial(CreateCourtSchema);

export const CourtResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    venueId: t.Optional(t.String()),
    name: t.Optional(t.String()),
    type: t.Optional(CourtTypeEnum),
    weekdayPeak: t.Optional(t.Number()),
    weekdayOffPeak: t.Optional(t.Number()),
    weekendPeak: t.Optional(t.Number()),
    weekendOffPeak: t.Optional(t.Number()),
    isActive: t.Optional(t.Boolean()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type CreateCourtInput = Static<typeof CreateCourtSchema>;
export type UpdateCourtInput = Static<typeof UpdateCourtSchema>;
