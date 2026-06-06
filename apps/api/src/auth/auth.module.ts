import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FirebaseAuthService } from "./firebase-auth.service";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { UsersModule } from "../users/users.module";
import { RolesGuard } from "./guards/roles.guard";

@Global()
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseAuthService,
    FirebaseAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, FirebaseAuthService, FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
