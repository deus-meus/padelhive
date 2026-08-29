import { Elysia } from "elysia";
import { firebaseAuthService } from "../modules/auth/service";
import { usersService } from "../modules/users/service";
import { RequestUser } from "../modules/auth/model";

export const authPlugin = new Elysia({ name: "authPlugin" })
  .derive({ as: "scoped" }, async ({ headers, query }) => {
    const authHeader = headers["authorization"] || headers["Authorization"];
    let token: string | null = null;

    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (query && typeof query === "object" && "token" in query && typeof (query as any).token === "string") {
      token = (query as any).token;
    }

    if (!token) {
      return { user: null as RequestUser | null };
    }

    try {
      const decoded = await firebaseAuthService.verifyIdToken(token);
      const user = await usersService.findOrCreateFromFirebaseToken(decoded);
      return { user };
    } catch (err) {
      console.warn(`[AuthPlugin] Token verification failed: ${String(err)}`);
      return { user: null as RequestUser | null };
    }
  });
