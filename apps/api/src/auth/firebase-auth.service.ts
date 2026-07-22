import { Injectable } from "@nestjs/common";
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
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

  private getFirebaseOptions(): any {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal '\n' strings and fix any corrupted quotes or formatting
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // If the path is specified, cert() will automatically load and parse the JSON file!
      return {
        credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      };
    }

    if (privateKey) {
      privateKey = privateKey
        .replace(/\\n/g, '\n')      // Convert literal \n to actual newlines
        .replace(/^"|"$/g, '')      // Remove surrounding quotes if they leaked
        .replace(/"$/, '');         // In case of weird docker env injection trailing quote

      // If it's a single flat string without \n but contains spaces between headers
      if (!privateKey.includes('\n')) {
        privateKey = privateKey.replace(/(-----BEGIN PRIVATE KEY-----)\s*(.*)\s*(-----END PRIVATE KEY-----)/, '$1\n$2\n$3');
        // also replace spaces with newlines in the base64 part
        privateKey = privateKey.split('\n').map((line, idx) => idx === 1 ? line.replace(/\s+/g, '\n') : line).join('\n');
      }
    }

    if (projectId && clientEmail && privateKey) {
      return {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      };
    }

    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
  }
}
