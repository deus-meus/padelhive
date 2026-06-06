import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";

@Controller("users")
export class UsersController {
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
