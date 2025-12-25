import admin from "firebase-admin";

let app: admin.app.App | undefined;

export const getFirebaseApp = (): admin.app.App => {
  if (!app) {
    app = admin.apps.length ? admin.apps[0] : admin.initializeApp();
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
