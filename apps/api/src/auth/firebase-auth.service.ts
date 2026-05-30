import { Injectable } from "@nestjs/common";

@Injectable()
export class FirebaseAuthService {
  verifyIdToken(idToken: string) {
    void idToken;
    throw new Error("FirebaseAuthService.verifyIdToken scaffold only; implement Firebase Admin verification in auth phase.");
  }
}
