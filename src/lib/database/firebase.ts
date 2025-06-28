import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

interface FirebaseConnection {
  db: any | null;
  promise: Promise<any> | null;
}

let cached: FirebaseConnection = (global as any).firebase;

if (!cached) {
  cached = (global as any).firebase = {
    db: null,
    promise: null,
  };
}

export const connectToFirebase = async () => {
  if (cached.db) return cached.db;

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL
  ) {
    throw new Error("Missing Firebase Admin configuration");
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  cached.promise =
    cached.promise ||
    Promise.resolve().then(() => {
      if (!getApps().length) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }
      return getFirestore();
    });

  cached.db = await cached.promise;
  return cached.db;
};
