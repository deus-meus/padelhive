import { t, Static } from "elysia";
import { UserRole } from "@prisma/client";

export const UserRoleEnum = t.Enum(UserRole);

export const RequestUserSchema = t.Object({
  id: t.String(),
  firebaseUid: t.String(),
  email: t.String(),
  name: t.String(),
  role: UserRoleEnum,
});

export type RequestUser = Static<typeof RequestUserSchema>;
