import { initializeApp, getApp, getApps } from "firebase/app";
import {
  collection,
  collectionGroup,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  getMessaging,
  isSupported as isMessagingSupported,
  type Messaging,
} from "firebase/messaging";
import { documentId, type Timestamp } from "firebase/firestore";

export type RequestStatus =
  | "draft"
  | "broadcasting"
  | "accepted"
  | "completed"
  | "no_show"
  | "cancelled";

export type RequestDoc = {
  createdByUid?: string;
  rawQuery: string;
  resolvedCategory?: string;
  lat: number;
  lng: number;
  status: RequestStatus;
  acceptedBusinessId?: string;
  createdAt?: Timestamp;
};

export type DeliveryDoc = {
  deliveredAt?: Timestamp;
};

export type OfferDoc = {
  businessId: string;
  message: string;
  price?: number;
  eta?: string;
  createdAt?: Timestamp;
};

export type ChatDoc = {
  requestId: string;
  userId: string;
  businessId: string;
  createdAt?: Timestamp;
};

export type ChatMessageDoc = {
  senderType: "user" | "business" | "system";
  text: string;
  createdAt?: Timestamp;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let messagingClient: Messaging | null = null;

export const getMessagingClient = async (): Promise<Messaging | null> => {
  if (messagingClient) {
    return messagingClient;
  }

  if (!(await isMessagingSupported())) {
    return null;
  }

  messagingClient = getMessaging(app);
  return messagingClient;
};

export const listenToRequest = (
  requestId: string,
  onData: (data: (RequestDoc & { id: string }) | null) => void
): Unsubscribe => {
  const requestRef = doc(db, "requests", requestId);

  return onSnapshot(requestRef, (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }

    onData({ id: snapshot.id, ...(snapshot.data() as RequestDoc) });
  });
};

export const listenToOffers = (
  requestId: string,
  onData: (data: Array<OfferDoc & { id: string }>) => void
): Unsubscribe => {
  const offersRef = collection(db, "requests", requestId, "offers");
  const offersQuery = query(offersRef, orderBy("createdAt", "asc"));

  return onSnapshot(offersQuery, (snapshot) => {
    onData(
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as OfferDoc),
      }))
    );
  });
};

export const listenToDeliveries = (
  businessId: string,
  onData: (data: Array<DeliveryDoc & { id: string; requestId: string }>) => void
): Unsubscribe => {
  const deliveriesQuery = query(
    collectionGroup(db, "deliveries"),
    where(documentId(), "==", businessId)
  );

  return onSnapshot(deliveriesQuery, (snapshot) => {
    onData(
      snapshot.docs.map((docSnapshot) => {
        const pathSegments = docSnapshot.ref.path.split("/");
        const requestId = pathSegments[pathSegments.indexOf("requests") + 1];

        return {
          id: docSnapshot.id,
          requestId,
          ...(docSnapshot.data() as DeliveryDoc),
        };
      })
    );
  });
};

export const listenToChat = (
  chatId: string,
  onData: (data: (ChatDoc & { id: string }) | null) => void
): Unsubscribe => {
  const chatRef = doc(db, "chats", chatId);

  return onSnapshot(chatRef, (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }

    onData({ id: snapshot.id, ...(snapshot.data() as ChatDoc) });
  });
};

export const listenToChatMessages = (
  chatId: string,
  onData: (data: Array<ChatMessageDoc & { id: string }>) => void
): Unsubscribe => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(messagesQuery, (snapshot) => {
    onData(
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as ChatMessageDoc),
      }))
    );
  });
};

export const listenToChatsByUser = (
  userId: string,
  onData: (data: Array<ChatDoc & { id: string }>) => void
): Unsubscribe => {
  const chatsQuery = query(
    collection(db, "chats"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(chatsQuery, (snapshot) => {
    onData(
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as ChatDoc),
      }))
    );
  });
};

export const listenToChatsByBusiness = (
  businessId: string,
  onData: (data: Array<ChatDoc & { id: string }>) => void
): Unsubscribe => {
  const chatsQuery = query(
    collection(db, "chats"),
    where("businessId", "==", businessId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(chatsQuery, (snapshot) => {
    onData(
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as ChatDoc),
      }))
    );
  });
};
