import { Resend } from "resend";
import { MailService } from "./service";

jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn(),
        },
      };
    }),
  };
});

describe("MailService", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    jest.clearAllMocks();
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

    expect(Resend).not.toHaveBeenCalled();
  });

  it("sends email when enabled", async () => {
    process.env = {
      ...originalEnv,
      MAIL_ENABLED: "true",
      RESEND_API_KEY: "test-key",
      MAIL_FROM: "from@padelhive.com",
    };
    const service = new MailService();

    const mockResendInstance = (Resend as jest.Mock).mock.results[0].value;
    mockResendInstance.emails.send.mockResolvedValueOnce({ id: "123" });

    await service.sendNotificationEmail({
      to: "test@example.com",
      type: "TEST",
      title: "Hello",
      body: "World",
      linkUrl: "/path",
    });

    expect(mockResendInstance.emails.send).toHaveBeenCalledTimes(1);
    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
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
    const service = new MailService();

    const mockResendInstance = (Resend as jest.Mock).mock.results[0].value;
    mockResendInstance.emails.send.mockRejectedValueOnce(
      new Error("Send failed"),
    );
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    await expect(
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
