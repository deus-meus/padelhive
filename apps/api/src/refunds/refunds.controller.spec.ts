import { Test, TestingModule } from "@nestjs/testing";
import { RefundsController } from "./refunds.controller";
import { RefundsService } from "./refunds.service";
import { RefundStatus, UserRole } from "@prisma/client";
import { RequestUser } from "../auth/types/request-user.type";

describe("RefundsController", () => {
  let controller: RefundsController;
  let service: RefundsService;

  const mockRefundsService = {
    createRefund: jest.fn(),
    findMyRefunds: jest.fn(),
    findAllRefunds: jest.fn(),
    findRefundById: jest.fn(),
    findRefundHistory: jest.fn(),
    approveRefund: jest.fn(),
    rejectRefund: jest.fn(),
    processRefund: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundsController],
      providers: [
        {
          provide: RefundsService,
          useValue: mockRefundsService,
        },
      ],
    }).compile();

    controller = module.get<RefundsController>(RefundsController);
    service = module.get<RefundsService>(RefundsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("createRefund calls service", async () => {
    mockRefundsService.createRefund.mockResolvedValue({ id: "1" });
    await expect(controller.createRefund({ id: "user-1", role: UserRole.PLAYER } as RequestUser, { bookingId: "b-1", reason: "r" })).resolves.toEqual({ id: "1" });
    expect(service.createRefund).toHaveBeenCalledWith("user-1", { bookingId: "b-1", reason: "r" });
  });

  it("findMyRefunds calls service", async () => {
    mockRefundsService.findMyRefunds.mockResolvedValue([]);
    await expect(controller.findMyRefunds({ id: "user-1" } as RequestUser)).resolves.toEqual([]);
    expect(service.findMyRefunds).toHaveBeenCalledWith("user-1");
  });

  it("findAllRefunds calls service", async () => {
    mockRefundsService.findAllRefunds.mockResolvedValue([]);
    await expect(controller.findAllRefunds(RefundStatus.PENDING)).resolves.toEqual([]);
    expect(service.findAllRefunds).toHaveBeenCalledWith(RefundStatus.PENDING);
  });

  it("findRefundById calls service with isSuperAdmin correctly", async () => {
    mockRefundsService.findRefundById.mockResolvedValue({ id: "1" });
    await expect(controller.findRefundById("1", { id: "user-1", role: UserRole.PLAYER } as RequestUser)).resolves.toEqual({ id: "1" });
    expect(service.findRefundById).toHaveBeenCalledWith("1", "user-1", false);

    await expect(controller.findRefundById("1", { id: "user-2", role: UserRole.SUPER_ADMIN } as RequestUser)).resolves.toEqual({ id: "1" });
    expect(service.findRefundById).toHaveBeenCalledWith("1", "user-2", true);
  });

  it("findRefundHistory calls service", async () => {
    mockRefundsService.findRefundHistory.mockResolvedValue([]);
    await expect(controller.findRefundHistory("1", { id: "user-1", role: UserRole.PLAYER } as RequestUser)).resolves.toEqual([]);
    expect(service.findRefundHistory).toHaveBeenCalledWith("1", "user-1", false);
  });

  it("approveRefund calls service", async () => {
    mockRefundsService.approveRefund.mockResolvedValue({ id: "1" });
    await expect(controller.approveRefund("1", { id: "admin-1" } as RequestUser, { adminNotes: "ok" })).resolves.toEqual({ id: "1" });
    expect(service.approveRefund).toHaveBeenCalledWith("1", "admin-1", "ok");
  });

  it("rejectRefund calls service", async () => {
    mockRefundsService.rejectRefund.mockResolvedValue({ id: "1" });
    await expect(controller.rejectRefund("1", { id: "admin-1" } as RequestUser, { adminNotes: "no" })).resolves.toEqual({ id: "1" });
    expect(service.rejectRefund).toHaveBeenCalledWith("1", "admin-1", "no");
  });

  it("processRefund calls service", async () => {
    mockRefundsService.processRefund.mockResolvedValue({ id: "1" });
    await expect(controller.processRefund("1", { id: "admin-1" } as RequestUser)).resolves.toEqual({ id: "1" });
    expect(service.processRefund).toHaveBeenCalledWith("1", "admin-1");
  });
});
