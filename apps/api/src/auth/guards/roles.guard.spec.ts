import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { RolesGuard } from "./roles.guard";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { RequestUser } from "../types/request-user.type";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let executionContext: ExecutionContext;
  let request: { user?: RequestUser };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);

    request = {};

    executionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  });

  it("should return true if no roles are required", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(executionContext);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      executionContext.getHandler(),
      executionContext.getClass(),
    ]);
  });

  it("should return true if empty roles array is required", () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(executionContext);

    expect(result).toBe(true);
  });

  it("should return true if user has required role", () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    request.user = { role: UserRole.SUPER_ADMIN } as unknown as RequestUser;

    const result = guard.canActivate(executionContext);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if roles required but user is undefined", () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    request.user = undefined;

    expect(() => guard.canActivate(executionContext)).toThrow(
      new ForbiddenException("Insufficient role"),
    );
  });

  it("should throw ForbiddenException if user role is not in required list", () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    request.user = { role: UserRole.PLAYER } as unknown as RequestUser;

    expect(() => guard.canActivate(executionContext)).toThrow(
      new ForbiddenException("Insufficient role"),
    );
  });
});
