import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { CourtsModule } from "./courts/courts.module";
import { InvitesModule } from "./invites/invites.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RefundsModule } from "./refunds/refunds.module";
import { UsersModule } from "./users/users.module";
import { VenuesModule } from "./venues/venues.module";
import { VouchersModule } from "./vouchers/vouchers.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    CourtsModule,
    BookingsModule,
    PaymentsModule,
    InvitesModule,
    VouchersModule,
    RefundsModule,
    AdminModule,
  ],
})
export class AppModule {}
