import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/index";

const client = treaty(app);

describe("Elysia API Endpoints via Eden Treaty", () => {
  it("GET /api/health returns HTTP 200 OK with database status", async () => {
    const { data, status } = await client.api.health.get();
    expect(status).toBe(200);
    if (status === 200 && data && "status" in data) {
      expect(data.status).toBe("ok");
      expect(data.services.database.status).toBe("up");
    }
  });

  it("GET /api/swagger returns Swagger documentation UI", async () => {
    const response = await app.handle(
      new Request("http://localhost:3001/api/swagger"),
    );
    expect(response.status).toBe(200);
  });
});
