import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { DecodedIdToken } from "firebase-admin/auth";
import { RequestUser } from "../auth/types/request-user.type";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateFromFirebaseToken(decodedToken: DecodedIdToken): Promise<RequestUser> {
    const email = decodedToken.email;

    if (!email) {
      throw new UnauthorizedException("Firebase token must include an email address");
    }

    const name = decodedToken.name ?? email;

    // First try to find by email to gracefully link manually seeded accounts
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // If user exists but firebaseUid is outdated (e.g. from local seeds), update it
      if (user.firebaseUid !== decodedToken.uid) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decodedToken.uid, name },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email,
          name,
          role: UserRole.PLAYER,
        },
      });
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name ?? user.email,
      role: user.role,
    };
  }
}
