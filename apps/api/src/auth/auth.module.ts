import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FirebaseAuthService } from "./firebase-auth.service";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthService, FirebaseAuthGuard, RolesGuard],
  exports: [AuthService, FirebaseAuthService, FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
