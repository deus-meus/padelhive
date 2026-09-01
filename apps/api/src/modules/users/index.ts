import { Elysia } from "elysia";
import { ensureAuth } from "../../common/auth.util";
import { authPlugin } from "../../plugins/auth";
import { RequestUserSchema } from "./model";

export const usersModule = new Elysia({ prefix: "/users", name: "usersModule" })
  .use(authPlugin)
  .get(
    "/me",
    ({ user }) => {
      return ensureAuth(user);
    },
    {
      response: RequestUserSchema,
      detail: {
        summary: "Get current user profile",
        tags: ["Users"],
      },
    },
  );
