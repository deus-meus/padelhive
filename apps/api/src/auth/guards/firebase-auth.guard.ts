import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { FirebaseAuthService } from "../firebase-auth.service";
import { RequestUser } from "../types/request-user.type";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
