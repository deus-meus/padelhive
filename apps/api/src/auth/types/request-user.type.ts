import { UserRole } from "@prisma/client";

export type RequestUser = {
  id: string;
  firebaseUid: string;
  email: string;
  role: UserRole;
};
