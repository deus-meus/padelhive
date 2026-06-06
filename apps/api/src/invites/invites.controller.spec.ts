import { UserRole } from "@prisma/client";
import { RequestUser } from "../auth/types/request-user.type";
import { InvitesController } from "./invites.controller";
import { InvitesService } from "./invites.service";

const requestUser: RequestUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "player@padelhive.com",
  name: "Player One",
  role: UserRole.PLAYER,
};

describe("InvitesController", () => {
  it("exposes public invite details", async () => {

    const service = {
      getInviteByToken: jest.fn().mockResolvedValue({ id: "invite-1" }),
      createInviteForBooking: jest.fn(),
      listInvitesForBooking: jest.fn(),
      rsvpByToken: jest.fn(),
    } as unknown as InvitesService;
    const controller = new InvitesController(service);

    await expect(controller.getByToken("invite-token-1")).resolves.toEqual({ id: "invite-1" });
    expect(service.getInviteByToken).toHaveBeenCalledWith("invite-token-1");
  });

  it("creates invite using current user id and booking id", async () => {
    const service = {
      getInviteByToken: jest.fn(),
      createInviteForBooking: jest.fn().mockResolvedValue({ id: "invite-1" }),
      listInvitesForBooking: jest.fn(),
      rsvpByToken: jest.fn(),
    } as unknown as InvitesService;
    const controller = new InvitesController(service);
    const body = { email: "friend@example.com" };

    await expect(controller.create("booking-1", body, requestUser)).resolves.toEqual({ id: "invite-1" });
    expect(service.createInviteForBooking).toHaveBeenCalledWith("user-1", "booking-1", body);
  });

  it("lists invites using current user id and booking id", async () => {
    const service = {
      getInviteByToken: jest.fn(),
      createInviteForBooking: jest.fn(),
      listInvitesForBooking: jest.fn().mockResolvedValue([{ id: "invite-1" }]),
      rsvpByToken: jest.fn(),
    } as unknown as InvitesService;
    const controller = new InvitesController(service);

    await expect(controller.list("booking-1", requestUser)).resolves.toEqual([{ id: "invite-1" }]);
    expect(service.listInvitesForBooking).toHaveBeenCalledWith("user-1", "booking-1");
  });

  it("updates RSVP by token without requiring current user", async () => {
    const service = {
      getInviteByToken: jest.fn(),
      createInviteForBooking: jest.fn(),
      listInvitesForBooking: jest.fn(),
      rsvpByToken: jest.fn().mockResolvedValue({ id: "invite-1", status: "ACCEPTED" }),
    } as unknown as InvitesService;
    const controller = new InvitesController(service);
    const body = { status: "ACCEPTED" as const };

    await expect(controller.rsvp("invite-token-1", body)).resolves.toEqual({ id: "invite-1", status: "ACCEPTED" });
    expect(service.rsvpByToken).toHaveBeenCalledWith("invite-token-1", body);
  });
});
