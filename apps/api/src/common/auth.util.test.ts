import { describe, expect, it } from "bun:test";
import { UserRole } from "@prisma/client";
import type { RequestUser } from "../modules/auth/model";
import { ensureAuth, ensureRoles } from "./auth.util";
import { ForbiddenException, UnauthorizedException } from "./errors";

describe("auth.util", () => {
  const mockUser: RequestUser = {
    id: "user-1",
    firebaseUid: "fb-1",
    email: "player@example.com",
    name: "Player One",
    role: UserRole.PLAYER,
  };

  const mockAdmin: RequestUser = {
    id: "admin-1",
    firebaseUid: "fb-admin",
    email: "admin@example.com",
    name: "Admin",
    role: UserRole.SUPER_ADMIN,
  };

  describe("ensureAuth", () => {
    it("returns user when user is present", () => {
      const result = ensureAuth(mockUser);
      expect(result).toEqual(mockUser);
    });

    it("throws UnauthorizedException when user is null or undefined", () => {
      expect(() => ensureAuth(null)).toThrow(UnauthorizedException);
      expect(() => ensureAuth(undefined)).toThrow(UnauthorizedException);
    });
  });

  describe("ensureRoles", () => {
    it("returns user when user has required role", () => {
      const result = ensureRoles(
        mockUser,
        UserRole.PLAYER,
        UserRole.VENUE_OWNER,
      );
      expect(result).toEqual(mockUser);

      const adminResult = ensureRoles(mockAdmin, UserRole.SUPER_ADMIN);
      expect(adminResult).toEqual(mockAdmin);
    });

    it("throws ForbiddenException when user does not have required role", () => {
      expect(() => ensureRoles(mockUser, UserRole.SUPER_ADMIN)).toThrow(
        ForbiddenException,
      );
    });

    it("throws UnauthorizedException when user is not authenticated", () => {
      expect(() => ensureRoles(null, UserRole.PLAYER)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
