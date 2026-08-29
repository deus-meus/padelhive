import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth } from "../../common/auth.util";
import { disputesService } from "./service";
import { CreateDisputeSchema } from "./model";

export const disputesModule = new Elysia({ prefix: "/disputes", name: "disputesModule" })
  .use(authPlugin)
  .post("/", ({ body, user }) => {
    const authed = ensureAuth(user);
    return disputesService.createDispute(authed.id, body);
  }, {
    body: CreateDisputeSchema,
    detail: { summary: "Submit dispute on booking", tags: ["Disputes"] },
  })
  .get("/me", ({ user }) => {
    const authed = ensureAuth(user);
    return disputesService.findMyDisputes(authed.id);
  }, {
    detail: { summary: "List current user's disputes", tags: ["Disputes"] },
  });
