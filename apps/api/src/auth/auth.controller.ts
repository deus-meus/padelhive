import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "./decorators/current-user.decorator";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { RequestUser } from "./types/request-user.type";

@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(FirebaseAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
