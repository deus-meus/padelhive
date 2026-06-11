import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { FirebaseAuthService } from "../auth/firebase-auth.service";

describe("Invites Throttling (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    // We boot the entire AppModule to test global routing limits 
    // and verify that non-throttled routes are unaffected.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseAuthService)
      .useValue({ verifyIdToken: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.getHttpAdapter().getInstance().set("trust proxy", 1); // Respect X-Forwarded-For

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should throttle GET /invites/:token after 10 requests, but not affect other routes", async () => {
    const token = "dummy-token";

    // 10 requests should pass the throttler 
    for (let i = 0; i < 10; i++) {
      const response = await request(app.getHttpServer())
        .get(`/invites/${token}`)
        .set("X-Forwarded-For", "192.168.1.1");
      
      expect(response.status).not.toBe(429); // Usually 404 because token doesn't exist
    }

    // 11th request should be throttled
    const throttledResponse = await request(app.getHttpServer())
      .get(`/invites/${token}`)
      .set("X-Forwarded-For", "192.168.1.1");
    
    expect(throttledResponse.status).toBe(429);

    // Another route should NOT be affected
    // GET /bookings/:bookingId/invites requires auth, so it returns 401 without auth token, but NOT 429
    const otherRouteResponse = await request(app.getHttpServer())
      .get("/bookings/some-booking-id/invites")
      .set("X-Forwarded-For", "192.168.1.1");
    
    expect(otherRouteResponse.status).not.toBe(429);
    
    // An authenticated or different IP should NOT be throttled on the invite route
    const diffIpResponse = await request(app.getHttpServer())
      .get(`/invites/${token}`)
      .set("X-Forwarded-For", "192.168.1.2");
      
    expect(diffIpResponse.status).not.toBe(429);
  });
});
