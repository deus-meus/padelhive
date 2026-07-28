import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../../users/users.service";
import { FirebaseAuthService } from "../firebase-auth.service";
import { RequestUser } from "../types/request-user.type";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined>; user?: RequestUser }>();
    const token = this.getBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    let decodedToken;
    try {
      decodedToken = await this.firebaseAuthService.verifyIdToken(token);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message;
      this.logger.warn(`Firebase token verification failed: ${code ?? "unknown"} - ${message ?? "no message"}`);
      throw new UnauthorizedException("Invalid bearer token");
    }

    try {
      request.user = await this.usersService.findOrCreateFromFirebaseToken(decodedToken);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Database error while fetching user from Firebase token: ${String(error)}`);
      throw error; // This will bubble up as a 500 Internal Server Error (or Prisma's filter might handle it), keeping the user's session valid locally.
    }
  }

  private getBearerToken(authorization: string | string[] | undefined): string | null {
    if (!authorization || Array.isArray(authorization)) return null;
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) return null;
    return token;
  }
}
