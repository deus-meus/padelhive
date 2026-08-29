import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth } from "../../common/auth.util";
import { paymentsService } from "./service";
import { CreatePaymentIntentSchema, MidtransWebhookSchema } from "./model";

export const paymentsModule = new Elysia({ prefix: "/payments", name: "paymentsModule" })
  .use(authPlugin)
  .post("/intents", ({ body, user }) => {
    const authed = ensureAuth(user);
    return paymentsService.createIntentForUser(authed.id, body);
  }, {
    body: CreatePaymentIntentSchema,
    detail: { summary: "Create payment intent", tags: ["Payments"] },
  })
  .get("/:id", ({ params, user }) => {
    const authed = ensureAuth(user);
    return paymentsService.findPaymentForUser(params.id, authed.id);
  }, {
    detail: { summary: "Get payment status by ID", tags: ["Payments"] },
  })
  .patch("/:id/mark-paid", ({ params, user }) => {
    const authed = ensureAuth(user);
    return paymentsService.markPaidForUser(params.id, authed.id);
  }, {
    detail: { summary: "Mark demo payment as paid", tags: ["Payments"] },
  })
  .post("/webhook", async ({ body, set }) => {
    await paymentsService.handleMidtransWebhook(body);
    set.status = 200;
    return { ok: true };
  }, {
    body: MidtransWebhookSchema,
    detail: { summary: "Midtrans webhook handler", tags: ["Payments"] },
  });
