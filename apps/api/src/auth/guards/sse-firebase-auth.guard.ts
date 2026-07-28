import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { FirebaseAuthService } from "../firebase-auth.service";
import { RequestUser } from "../types/request-user.type";

@Injectable()
export class SseFirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SseFirebaseAuthGuard.name);
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ query: Record<string, unknown>; user?: RequestUser }>();
    const raw = request.query?.token;
    const token = typeof raw === "string" ? raw : Array.isArray(raw) && typeof raw[0] === "string" ? raw[0] : null;
    if (!token) throw new UnauthorizedException("Missing token");
    let decoded;
    try {
      decoded = await this.firebaseAuthService.verifyIdToken(token);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message;
      this.logger.warn(`SSE token verification failed: ${code ?? "unknown"} - ${message ?? "no message"}`);
      throw new UnauthorizedException("Invalid token");
    }

    try {
      request.user = await this.usersService.findOrCreateFromFirebaseToken(decoded);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Database error while fetching user from SSE token: ${String(error)}`);
      throw error;
    }
  }
}
