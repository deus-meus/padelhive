import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth } from "../../common/auth.util";
import { RequestUserSchema } from "./model";

export const authModule = new Elysia({ prefix: "/auth", name: "authModule" })
  .use(authPlugin)
  .get("/me", ({ user }) => {
    return ensureAuth(user);
  }, {
    response: RequestUserSchema,
    detail: {
      summary: "Get current authenticated user profile",
      tags: ["Auth"],
    },
  });
