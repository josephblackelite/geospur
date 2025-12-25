import { getToken } from "firebase/messaging";
import { getMessagingClient } from "./firebase";

const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const registerPushToken = async (
  idToken: string,
  businessId?: string
): Promise<void> => {
  if (!idToken) {
    return;
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    return;
  }

  const messaging = await getMessagingClient();
  if (!messaging) {
    return;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY;
  const token = await getToken(messaging, { vapidKey });
  if (!token) {
    return;
  }

  const payload: { token: string; businessId?: string } = { token };
  if (businessId) {
    payload.businessId = businessId;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/register-push-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to register push token.");
  }
};
