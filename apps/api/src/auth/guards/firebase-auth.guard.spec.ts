import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FirebaseAuthGuard } from "./firebase-auth.guard";
import { FirebaseAuthService } from "../firebase-auth.service";
import { UsersService } from "../../users/users.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { RequestUser } from "../types/request-user.type";

describe("FirebaseAuthGuard", () => {
  let guard: FirebaseAuthGuard;
  let firebaseAuthService: jest.Mocked<FirebaseAuthService>;
  let usersService: jest.Mocked<UsersService>;
  let reflector: jest.Mocked<Reflector>;
  let executionContext: ExecutionContext;
  let request: any;

  beforeEach(() => {
    firebaseAuthService = {
      verifyIdToken: jest.fn(),
    } as unknown as jest.Mocked<FirebaseAuthService>;

    usersService = {
      findOrCreateFromFirebaseToken: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new FirebaseAuthGuard(firebaseAuthService, usersService, reflector);

    request = {
      headers: {},
    };

    executionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  });

  it("should return true if route is public", async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(executionContext);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      executionContext.getHandler(),
      executionContext.getClass(),
    ]);
    expect(firebaseAuthService.verifyIdToken).not.toHaveBeenCalled();
    expect(usersService.findOrCreateFromFirebaseToken).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedException if authorization header is missing", async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      new UnauthorizedException("Missing bearer token"),
    );
  });

  it("should throw UnauthorizedException if authorization header is malformed", async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    request.headers.authorization = "Token abc";

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      new UnauthorizedException("Missing bearer token"),
    );

    request.headers.authorization = "Bearer ";

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      new UnauthorizedException("Missing bearer token"),
    );
  });

  it("should return true and set request.user if token is valid", async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    request.headers.authorization = "Bearer good-token";

    const decodedToken = { uid: "123" };
    const mockUser = { id: "user1" } as RequestUser;

    firebaseAuthService.verifyIdToken.mockResolvedValue(decodedToken as any);
    usersService.findOrCreateFromFirebaseToken.mockResolvedValue(mockUser as any);

    const result = await guard.canActivate(executionContext);

    expect(result).toBe(true);
    expect(firebaseAuthService.verifyIdToken).toHaveBeenCalledWith("good-token");
    expect(usersService.findOrCreateFromFirebaseToken).toHaveBeenCalledWith(decodedToken);
    expect(request.user).toBe(mockUser);
  });

  it("should throw UnauthorizedException if verifyIdToken throws", async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    request.headers.authorization = "Bearer bad-token";

    firebaseAuthService.verifyIdToken.mockRejectedValue(new Error("Firebase error"));

    await expect(guard.canActivate(executionContext)).rejects.toThrow(
      new UnauthorizedException("Invalid bearer token"),
    );
  });
});
