import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpException } from "../../common/errors";
import { UploadsService } from "./service";

describe("UploadsService", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws HttpException if Cloudinary credentials are missing", () => {
    process.env = { ...originalEnv };
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const service = new UploadsService();
    expect(() => service.createSignature()).toThrow(HttpException);
  });

  it("creates valid signature payload when credentials are configured", () => {
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-key",
      CLOUDINARY_API_SECRET: "test-secret",
    };

    const service = new UploadsService();
    const result = service.createSignature();

    expect(result.cloudName).toBe("test-cloud");
    expect(result.apiKey).toBe("test-key");
    expect(result.folder).toBe("padelhive/venues");
    expect(typeof result.timestamp).toBe("number");
    expect(typeof result.signature).toBe("string");
    expect(result.signature).toHaveLength(40); // SHA-1 hex output length
  });
});
