import { describe, expect, it, mock } from "bun:test";
import { UserRole } from "@prisma/client";
import { ensureAuth, ensureRoles } from "../../common/auth.util";
import { ForbiddenException, UnauthorizedException } from "../../common/errors";
import { UsersService } from "../users/service";
import type { RequestUser } from "./model";

const playerUser: RequestUser = {
  id: "user-player",
  firebaseUid: "firebase-player",
  email: "player@padelhive.com",
  name: "Padelhive Player",
  role: UserRole.PLAYER,
};

const adminUser: RequestUser = {
  id: "user-admin",
  firebaseUid: "firebase-admin",
  email: "admin@padelhive.com",
  name: "Padelhive Admin",
  role: UserRole.SUPER_ADMIN,
};

describe("UsersService", () => {
  it("creates PLAYER user on first Firebase login", async () => {
    const prisma = {
      user: {
        findUnique: mock().mockResolvedValue(null),
        create: mock().mockResolvedValue({
          id: "user-new",
          firebaseUid: "firebase-new",
          email: "new@padelhive.com",
          name: "New Player",
          role: UserRole.PLAYER,
        }),
      },
    };
    const service = new UsersService(prisma as never);

    const result = await service.findOrCreateFromFirebaseToken({
      uid: "firebase-new",
      email: "new@padelhive.com",
      name: "New Player",
    } as never);

    expect(result).toEqual({
      id: "user-new",
      firebaseUid: "firebase-new",
      email: "new@padelhive.com",
      name: "New Player",
      role: UserRole.PLAYER,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "new@padelhive.com" },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseUid: "firebase-new",
        email: "new@padelhive.com",
        name: "New Player",
        role: UserRole.PLAYER,
      },
    });
  });
});

describe("Auth Plugin Guards", () => {
  it("ensureAuth allows authenticated user", () => {
    expect(ensureAuth(playerUser)).toEqual(playerUser);
  });

  it("ensureAuth throws UnauthorizedException when user is null", () => {
    expect(() => ensureAuth(null)).toThrow(UnauthorizedException);
  });

  it("ensureRoles allows SUPER_ADMIN access", () => {
    expect(ensureRoles(adminUser, UserRole.SUPER_ADMIN)).toEqual(adminUser);
  });

  it("ensureRoles rejects PLAYER access to SUPER_ADMIN routes", () => {
    expect(() => ensureRoles(playerUser, UserRole.SUPER_ADMIN)).toThrow(
      ForbiddenException,
    );
  });
});
