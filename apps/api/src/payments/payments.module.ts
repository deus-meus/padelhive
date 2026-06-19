import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PAYMENT_GATEWAY_TOKEN } from "./gateways/payment-gateway.interface";
import { MidtransGateway } from "./gateways/midtrans.gateway";

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MidtransGateway,
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass: MidtransGateway,
    },
  ],
  exports: [PaymentsService, PAYMENT_GATEWAY_TOKEN],
})
export class PaymentsModule {}
