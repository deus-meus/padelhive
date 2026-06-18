import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { VenuesModule } from "../venues/venues.module";
import { VouchersModule } from "../vouchers/vouchers.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [UsersModule, VenuesModule, VouchersModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
