import { Injectable } from "@nestjs/common";
import { App, applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, DecodedIdToken, getAuth } from "firebase-admin/auth";

@Injectable()
export class FirebaseAuthService {
  private readonly app: App;
  private readonly auth: Auth;

  constructor() {
    this.app = getApps()[0] ?? initializeApp(this.getFirebaseOptions());
    this.auth = getAuth(this.app);
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(idToken, true);
  }

  private getFirebaseOptions() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      return {
        credential: cert({ projectId, clientEmail, privateKey }),
      };
    }

    return {
      credential: applicationDefault(),
      projectId,
    };
  }
}
