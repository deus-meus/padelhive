import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
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
import { ReviewsModule } from "./reviews/reviews.module";
import { DisputesModule } from "./disputes/disputes.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";

import { UploadsModule } from "./uploads/uploads.module";
import { StatsModule } from "./stats/stats.module";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [RedisService],
      useFactory: (redis: RedisService) => ({
        throttlers: [{ ttl: 60000, limit: 10 }],
        storage: redis.isEnabled && redis.getPublisher()
          ? new ThrottlerStorageRedisService(redis.getPublisher() as any)
          : undefined,
      }),
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    UploadsModule,
    CourtsModule,
    BookingsModule,
    PaymentsModule,
    InvitesModule,
    VouchersModule,
    ReviewsModule,
    RefundsModule,
    DisputesModule,
    NotificationsModule,
    AdminModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
