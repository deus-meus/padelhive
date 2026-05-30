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

    const user = await this.prisma.user.upsert({
      where: { firebaseUid: decodedToken.uid },
      update: { email, name },
      create: {
        firebaseUid: decodedToken.uid,
        email,
        name,
        role: UserRole.PLAYER,
      },
    });

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
