import { PrismaClient } from "@prisma/client";
import { cert, applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (process.env.NODE_ENV === "production") {
  console.error("Cannot run test auth seed in production.");
  process.exit(1);
}

const prisma = new PrismaClient();

function initFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

const app = initFirebaseAdmin();
const auth = getAuth(app);

const TEST_ACCOUNTS = [
  { email: "admin@padelhive.com", password: "Padel#Super1", role: "SUPER_ADMIN", name: "Admin Padelhive" },
  { email: "budi.owner@padelhive.com", password: "Padel#Owner1", role: "VENUE_OWNER", name: "Budi Owner" },
  { email: "lisa.admin@padelhive.com", password: "Padel#Admin1", role: "VENUE_ADMIN", name: "Lisa Admin" },
  { email: "andi@example.com", password: "Padel#Player1", role: "PLAYER", name: "Andi Player" },
];

async function main() {
  console.log("Seeding Firebase test accounts...");
  const summary = [];

  for (const account of TEST_ACCOUNTS) {
    let firebaseUid: string;
    try {
      const userRecord = await auth.getUserByEmail(account.email);
      await auth.updateUser(userRecord.uid, { password: account.password });
      firebaseUid = userRecord.uid;
      console.log(`Updated Firebase user: ${account.email}`);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "auth/user-not-found") {
        const newUser = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.name,
          emailVerified: true,
        });
        firebaseUid = newUser.uid;
        console.log(`Created Firebase user: ${account.email}`);
      } else {
        throw error;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleValue = account.role as any;

    const dbUser = await prisma.user.upsert({
      where: { email: account.email },
      update: { firebaseUid },
      create: {
        email: account.email,
        name: account.name,
        role: roleValue,
        firebaseUid,
      },
    });

    summary.push({
      Email: account.email,
      Role: dbUser.role,
      "Firebase UID": firebaseUid,
    });
  }

  console.table(summary);
  console.log("Firebase test auth seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
