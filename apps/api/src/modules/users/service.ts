import { UserRole } from "@prisma/client";
import type { DecodedIdToken } from "firebase-admin/auth";
import { UnauthorizedException } from "../../common/errors";
import {
  prisma as defaultPrisma,
  type PrismaService,
} from "../../common/prisma";
import type { RequestUser } from "../auth/model";

export class UsersService {
  constructor(private readonly prisma: PrismaService = defaultPrisma) {}

  async findOrCreateFromFirebaseToken(
    decodedToken: DecodedIdToken,
  ): Promise<RequestUser> {
    const email = decodedToken.email;

    if (!email) {
      throw new UnauthorizedException(
        "Firebase token must include an email address",
      );
    }

    const name = decodedToken.name ?? email;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
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
      name: user.name,
      role: user.role,
    };
  }
}

export const usersService = new UsersService();
