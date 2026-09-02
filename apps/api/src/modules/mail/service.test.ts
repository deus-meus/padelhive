import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { MailService } from "./service";

const sendFn = mock();
mock.module("resend", () => {
  return {
    Resend: mock().mockImplementation(() => {
      return {
        emails: {
          send: sendFn,
        },
      };
    }),
  };
});

describe("MailService", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    sendFn.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is disabled when MAIL_ENABLED is not true, and does not send", async () => {
    process.env = {
      ...originalEnv,
      MAIL_ENABLED: "false",
      RESEND_API_KEY: "test-key",
    };
    const service = new MailService();
    await service.sendNotificationEmail({
      to: "test@example.com",
      type: "TEST",
      title: "T",
      body: "B",
    });

    expect(sendFn).not.toHaveBeenCalled();
  });

  it("sends email when enabled", async () => {
    process.env = {
      ...originalEnv,
      MAIL_ENABLED: "true",
      RESEND_API_KEY: "test-key",
      MAIL_FROM: "from@padelhive.com",
    };
    sendFn.mockResolvedValueOnce({ id: "123" });
    const service = new MailService();

    await service.sendNotificationEmail({
      to: "test@example.com",
      type: "TEST",
      title: "Hello",
      body: "World",
      linkUrl: "/path",
    });

    expect(sendFn).toHaveBeenCalledTimes(1);
    expect(sendFn).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "from@padelhive.com",
        to: "test@example.com",
        subject: "Hello",
        html: expect.any(String),
        text: expect.stringContaining("View details"),
      }),
    );
  });

  it("swallows errors without throwing", async () => {
    process.env = {
      ...originalEnv,
      MAIL_ENABLED: "true",
      RESEND_API_KEY: "test-key",
    };
    sendFn.mockRejectedValueOnce(new Error("Send failed"));
    const service = new MailService();
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

    expect(
      service.sendNotificationEmail({
        to: "test@example.com",
        type: "TEST",
        title: "T",
        body: "B",
      }),
    ).resolves.toBeUndefined();
    warnSpy.mockRestore();
  });
});
