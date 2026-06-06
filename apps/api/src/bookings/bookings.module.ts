import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { BookingExpiryService } from "./booking-expiry.service";

@Module({
  imports: [UsersModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingExpiryService],
  exports: [BookingsService],
})
export class BookingsModule {}
