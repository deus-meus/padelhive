import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";

@Controller("users")
export class UsersController {
  @Get("me")
  @UseGuards(FirebaseAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
