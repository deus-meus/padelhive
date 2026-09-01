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

export type CreateCourtInput = Static<typeof CreateCourtSchema>;
export type UpdateCourtInput = Static<typeof UpdateCourtSchema>;
