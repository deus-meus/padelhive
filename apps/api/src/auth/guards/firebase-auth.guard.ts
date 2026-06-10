import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../../users/users.service";
import { FirebaseAuthService } from "../firebase-auth.service";
import { RequestUser } from "../types/request-user.type";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
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

    try {
      const decodedToken = await this.firebaseAuthService.verifyIdToken(token);
      request.user = await this.usersService.findOrCreateFromFirebaseToken(decodedToken);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("Invalid bearer token");
    }
  }

  private getBearerToken(authorization: string | string[] | undefined): string | null {
    if (!authorization || Array.isArray(authorization)) return null;
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) return null;
    return token;
  }
}
