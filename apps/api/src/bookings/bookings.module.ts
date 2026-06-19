import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { VouchersModule } from "../vouchers/vouchers.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { BookingExpiryService } from "./booking-expiry.service";
import { BookingSplitService } from "./booking-split.service";

@Module({
  imports: [UsersModule, VouchersModule, NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingExpiryService, BookingSplitService],
  exports: [BookingsService],
})
export class BookingsModule {}
