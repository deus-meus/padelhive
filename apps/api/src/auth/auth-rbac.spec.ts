import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { AdminController } from "../admin/admin.controller";
import { AdminService } from "../admin/admin.service";
import { AuthController } from "./auth.controller";
import { ROLES_KEY } from "./decorators/roles.decorator";
import { FirebaseAuthService } from "./firebase-auth.service";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { RequestUser } from "./types/request-user.type";
import { UsersController } from "../users/users.controller";
import { UsersService } from "../users/users.service";

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

function createExecutionContext(authorization?: string, user?: RequestUser) {
  const request = {
    headers: { authorization },
    user,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => createExecutionContext,
    getClass: () => FirebaseAuthGuard,
  } as never;
}

describe("FirebaseAuthGuard", () => {
  it("rejects missing bearer token", async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const guard = new FirebaseAuthGuard({} as FirebaseAuthService,{} as UsersService, reflector);

    await expect(guard.canActivate(createExecutionContext())).rejects.toThrow(UnauthorizedException);
  });

  it("rejects invalid bearer token", async () => {
    const firebaseAuthService = {
      verifyIdToken: jest.fn().mockRejectedValue(new Error("invalid token")),
    } as unknown as FirebaseAuthService;
    const usersService = {
      findOrCreateFromFirebaseToken: jest.fn(),
    } as unknown as UsersService;
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const guard = new FirebaseAuthGuard(firebaseAuthService, usersService, reflector);

    await expect(guard.canActivate(createExecutionContext("Bearer invalid-token"))).rejects.toThrow(UnauthorizedException);
    expect(usersService.findOrCreateFromFirebaseToken).not.toHaveBeenCalled();
  });

  it("syncs user and attaches request user for valid token", async () => {
    const firebaseAuthService = {
      verifyIdToken: jest.fn().mockResolvedValue({ uid: "firebase-player", email: "player@padelhive.com" }),
    } as unknown as FirebaseAuthService;
    const usersService = {
      findOrCreateFromFirebaseToken: jest.fn().mockResolvedValue(playerUser),
    } as unknown as UsersService;
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const guard = new FirebaseAuthGuard(firebaseAuthService, usersService, reflector);
    const context = createExecutionContext("Bearer valid-token");

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const request = (context as { switchToHttp: () => { getRequest: () => { user?: RequestUser } } }).switchToHttp().getRequest();
    expect(request.user).toEqual(playerUser);
  });

  it("bypasses auth completely when route is @Public()", async () => {
    const firebaseAuthService = { verifyIdToken: jest.fn() } as unknown as FirebaseAuthService;
    const usersService = { findOrCreateFromFirebaseToken: jest.fn() } as unknown as UsersService;
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const guard = new FirebaseAuthGuard(firebaseAuthService, usersService, reflector);
    
    await expect(guard.canActivate(createExecutionContext())).resolves.toBe(true);
    expect(firebaseAuthService.verifyIdToken).not.toHaveBeenCalled();
  });
});

describe("UsersService", () => {
  it("creates PLAYER user on first Firebase login", async () => {
    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: "user-new",
          firebaseUid: "firebase-new",
          email: "new@padelhive.com",
          name: "New Player",
          role: UserRole.PLAYER,
        }),
      },
    };
    const service = new UsersService(prisma as never);

    await expect(
      service.findOrCreateFromFirebaseToken({
        uid: "firebase-new",
        email: "new@padelhive.com",
        name: "New Player",
      } as never),
    ).resolves.toEqual({
      id: "user-new",
      firebaseUid: "firebase-new",
      email: "new@padelhive.com",
      name: "New Player",
      role: UserRole.PLAYER,
    });

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { firebaseUid: "firebase-new" },
      update: { email: "new@padelhive.com", name: "New Player" },
      create: {
        firebaseUid: "firebase-new",
        email: "new@padelhive.com",
        name: "New Player",
        role: UserRole.PLAYER,
      },
    });
  });
});

describe("RolesGuard", () => {
  it("allows SUPER_ADMIN access", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPER_ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createExecutionContext("Bearer token", adminUser))).toBe(true);
  });

  it("rejects PLAYER access to SUPER_ADMIN routes", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPER_ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createExecutionContext("Bearer token", playerUser))).toThrow(ForbiddenException);
  });

  it("allows routes without role metadata", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createExecutionContext("Bearer token", playerUser))).toBe(true);
  });
});

describe("me controllers", () => {
  it("returns current user from auth me", () => {
    expect(new AuthController().me(playerUser)).toEqual(playerUser);
  });

  it("returns current user from users me", () => {
    expect(new UsersController().me(playerUser)).toEqual(playerUser);
  });

  it("returns current user from admin me", () => {
    expect(new AdminController(undefined as unknown as AdminService, undefined as unknown as unknown).me(adminUser)).toEqual(adminUser);
  });

  it("declares SUPER_ADMIN metadata on admin me", () => {
    const roles = Reflect.getMetadata(ROLES_KEY, AdminController.prototype.me);
    expect(roles).toEqual([UserRole.SUPER_ADMIN]);
  });
});
