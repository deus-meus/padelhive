import { Controller, Get } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RequestUser } from "../auth/types/request-user.type";

@Controller("admin")
export class AdminController {
  @Get("me")
  @Roles(UserRole.SUPER_ADMIN)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
