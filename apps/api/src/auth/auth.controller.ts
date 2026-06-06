import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RequestUser } from "./types/request-user.type";

@Controller("auth")
export class AuthController {
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
