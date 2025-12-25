import fs from "node:fs";
import admin from "firebase-admin";

let app: admin.app.App | undefined;

const getServiceAccountPath = (): string => {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS."
    );
  }

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase Admin credentials not found at path: ${serviceAccountPath}`
    );
  }

  return serviceAccountPath;
};

const readServiceAccount = (): admin.ServiceAccount => {
  const serviceAccountPath = getServiceAccountPath();
  const raw = fs.readFileSync(serviceAccountPath, "utf8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Firebase Admin credentials at ${serviceAccountPath} are not valid JSON.`,
      { cause: error }
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as { type?: string }).type !== "service_account"
  ) {
    throw new Error(
      `Firebase Admin credentials at ${serviceAccountPath} must be a service account JSON.`
    );
  }

  const { client_email: clientEmail, private_key: privateKey } = parsed as {
    client_email?: string;
    private_key?: string;
  };

  if (!clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin credentials at ${serviceAccountPath} are missing client_email or private_key.`
    );
  }

  return parsed as admin.ServiceAccount;
};

export const getFirebaseApp = (): admin.app.App => {
  if (!app) {
    const serviceAccount = readServiceAccount();
    app = admin.apps.length
      ? admin.apps[0]
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
  }

  return app;
};

export const getFirestore = (): admin.firestore.Firestore => {
  return getFirebaseApp().firestore();
};

export const getAuth = (): admin.auth.Auth => {
  return getFirebaseApp().auth();
};

export const getMessaging = (): admin.messaging.Messaging => {
  return getFirebaseApp().messaging();
};
