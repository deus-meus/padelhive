import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { HttpException } from "./common/errors";
import { authModule } from "./modules/auth";
import { usersModule } from "./modules/users";
import { venuesModule } from "./modules/venues";
import { courtsModule } from "./modules/courts";
import { bookingsModule } from "./modules/bookings";
import { paymentsModule } from "./modules/payments";
import { refundsModule } from "./modules/refunds";
import { invitesModule } from "./modules/invites";
import { vouchersModule } from "./modules/vouchers";
import { reviewsModule } from "./modules/reviews";
import { disputesModule } from "./modules/disputes";
import { adminModule } from "./modules/admin";
import { notificationsModule } from "./modules/notifications";
import { uploadsModule } from "./modules/uploads";
import { statsModule } from "./modules/stats";
import { bookingExpiryService } from "./modules/bookings/expiry.service";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type", "Accept"],
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    })
  )
  .use(
    swagger({
      path: "/api/swagger",
      documentation: {
        info: {
          title: "Padelhive API (ElysiaJS)",
          version: "1.0.0",
          description: "High-performance Padel booking platform API powered by Bun and ElysiaJS",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Users", description: "User profile endpoints" },
          { name: "Venues", description: "Padel venues discovery & availability" },
          { name: "Courts", description: "Court scheduling & pricing management" },
          { name: "Bookings", description: "Booking reservation & split payments" },
          { name: "Payments", description: "Payment intents and Midtrans gateway webhooks" },
          { name: "Refunds", description: "Cancellation refunds and dispute review workflows" },
          { name: "Invites", description: "Friend invite links and RSVP management" },
          { name: "Vouchers", description: "Promotional discount codes" },
          { name: "Reviews", description: "Player reviews and venue ratings" },
          { name: "Disputes", description: "Dispute resolution and complaint tracking" },
          { name: "Admin", description: "Super Admin dashboards and platform metrics" },
          { name: "Notifications", description: "Real-time SSE push stream & user alerts" },
          { name: "Uploads", description: "Cloudinary upload signatures" },
          { name: "Stats", description: "Live marketplace metrics" },
        ],
      },
    })
  )
  .onError(({ error, set, code }) => {
    if (error instanceof HttpException) {
      set.status = error.statusCode;
      return {
        statusCode: error.statusCode,
        message: error.message,
        error: error.name,
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        statusCode: 400,
        message: (error as any)?.message || "Validation Error",
        error: "Bad Request",
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        statusCode: 404,
        message: "Route not found",
        error: "Not Found",
      };
    }

    console.error("[ServerError]", error);
    set.status = 500;
    return {
      statusCode: 500,
      message: (error as any)?.message || "Internal Server Error",
      error: "Internal Server Error",
    };
  })
  .group("/api", (app) =>
    app
      .use(authModule)
      .use(usersModule)
      .use(venuesModule)
      .use(courtsModule)
      .use(bookingsModule)
      .use(paymentsModule)
      .use(refundsModule)
      .use(invitesModule)
      .use(vouchersModule)
      .use(reviewsModule)
      .use(disputesModule)
      .use(adminModule)
      .use(notificationsModule)
      .use(uploadsModule)
      .use(statsModule)
  );

// Background cron interval (sweeps expired bookings & unpaid reschedule charges)
if (process.env.NODE_ENV !== "test") {
  setInterval(async () => {
    try {
      await bookingExpiryService.sweepExpiredBookings();
      await bookingExpiryService.sweepUnpaidRescheduleCharges();
      await bookingExpiryService.sweepCompletedBookings();
    } catch (err) {
      console.warn(`[Cron] Background sweep error: ${String(err)}`);
    }
  }, 60000);
}

app.listen(port, () => {
  console.log(`🎾 Padelhive API (ElysiaJS) running at http://localhost:${port}/api`);
  console.log(`📖 Swagger documentation available at http://localhost:${port}/api/swagger`);
});

export type App = typeof app;
