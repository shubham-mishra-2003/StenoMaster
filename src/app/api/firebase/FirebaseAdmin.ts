import { initializeApp, cert, getApps, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

const requiredEnvVars: (keyof ServiceAccount)[] = ['projectId', 'privateKey', 'clientEmail'];
const missingFields = requiredEnvVars.filter(key => !serviceAccount[key]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
}

if (serviceAccount.privateKey && !serviceAccount.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  throw new Error('Invalid PRIVATE_KEY format: Must include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----');
}

let db: Firestore;

try {
  let app: App;
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    serviceAccount: {
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey ? '[REDACTED]' : undefined,
    },
  });
  throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

export { db };