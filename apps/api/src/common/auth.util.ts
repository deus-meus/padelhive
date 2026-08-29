import { UserRole } from "@prisma/client";
import { RequestUser } from "../modules/auth/model";
import { UnauthorizedException, ForbiddenException } from "./errors";

export function ensureAuth(user: RequestUser | null | undefined): RequestUser {
  if (!user) {
    throw new UnauthorizedException("Authentication required");
  }
  return user;
}

export function ensureRoles(user: RequestUser | null | undefined, ...roles: UserRole[]): RequestUser {
  const authed = ensureAuth(user);
  if (!roles.includes(authed.role)) {
    throw new ForbiddenException("Forbidden resource");
  }
  return authed;
}
