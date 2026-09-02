import { describe, expect, it, mock } from "bun:test";
import { UserRole } from "@prisma/client";
import type { DecodedIdToken } from "firebase-admin/auth";
import { UnauthorizedException } from "../../common/errors";
import { UsersService } from "./service";

describe("UsersService", () => {
  const mockUser = {
    id: "user-123",
    firebaseUid: "fb-123",
    email: "test@example.com",
    name: "Test User",
    role: UserRole.PLAYER,
  };

  it("throws UnauthorizedException if decoded token has no email", async () => {
    const service = new UsersService({} as never);
    const token = { uid: "fb-123" } as DecodedIdToken;

    expect(service.findOrCreateFromFirebaseToken(token)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("finds existing user and returns without update if firebaseUid matches", async () => {
    const mockPrisma = {
      user: {
        findUnique: mock().mockResolvedValue(mockUser),
        update: mock(),
        create: mock(),
      },
    };
    const service = new UsersService(mockPrisma as never);
    const token = {
      uid: "fb-123",
      email: "test@example.com",
      name: "Test User",
    } as unknown as DecodedIdToken;

    const result = await service.findOrCreateFromFirebaseToken(token);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: "user-123",
      firebaseUid: "fb-123",
      email: "test@example.com",
      name: "Test User",
      role: UserRole.PLAYER,
    });
  });

  it("updates existing user if firebaseUid differs", async () => {
    const updatedUser = { ...mockUser, firebaseUid: "new-fb-uid" };
    const mockPrisma = {
      user: {
        findUnique: mock().mockResolvedValue(mockUser),
        update: mock().mockResolvedValue(updatedUser),
        create: mock(),
      },
    };
    const service = new UsersService(mockPrisma as never);
    const token = {
      uid: "new-fb-uid",
      email: "test@example.com",
      name: "Test User",
    } as unknown as DecodedIdToken;

    const result = await service.findOrCreateFromFirebaseToken(token);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { firebaseUid: "new-fb-uid", name: "Test User" },
    });
    expect(result.firebaseUid).toBe("new-fb-uid");
  });

  it("creates a new player if user does not exist", async () => {
    const newUser = {
      id: "new-user-id",
      firebaseUid: "fb-456",
      email: "new@example.com",
      name: "New Player",
      role: UserRole.PLAYER,
    };
    const mockPrisma = {
      user: {
        findUnique: mock().mockResolvedValue(null),
        create: mock().mockResolvedValue(newUser),
      },
    };
    const service = new UsersService(mockPrisma as never);
    const token = {
      uid: "fb-456",
      email: "new@example.com",
      name: "New Player",
    } as unknown as DecodedIdToken;

    const result = await service.findOrCreateFromFirebaseToken(token);

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseUid: "fb-456",
        email: "new@example.com",
        name: "New Player",
        role: UserRole.PLAYER,
      },
    });
    expect(result).toEqual(newUser);
  });
});
