import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureRoles } from "../../common/auth.util";
import { uploadsService } from "./service";
import { UserRole } from "@prisma/client";
import { UploadSignatureSchema } from "./model";

export const uploadsModule = new Elysia({ prefix: "/uploads", name: "uploadsModule" })
  .use(authPlugin)
  .post("/signature", ({ user }) => {
    ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return uploadsService.createSignature();
  }, {
    response: UploadSignatureSchema,
    detail: { summary: "Generate Cloudinary upload signature", tags: ["Uploads"] },
  });
