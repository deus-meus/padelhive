import { Module } from "@nestjs/common";
import { VenuesController } from "./venues.controller";
import { VenuesService } from "./venues.service";
import { AvailabilityService } from "./availability.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [VenuesController],
  providers: [VenuesService, AvailabilityService],
  exports: [VenuesService, AvailabilityService],
})
export class VenuesModule {}
