import { Router } from "express";
import admin from "firebase-admin";
import { type AuthenticatedRequest, verifyFirebaseToken } from "./auth";
import { getFirestore } from "./firestore";

export const routes = Router();

const NO_SHOW_THRESHOLD_MINUTES = 30;

const ensureString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${field}`);
  }
  return value.trim();
};

const resolveCategory = (rawQuery: string): string => {
  const normalized = rawQuery.toLowerCase();
  if (/(restaurant|food|dinner|lunch|brunch|breakfast)/.test(normalized)) {
    return "restaurant";
  }
  if (/(bar|club|lounge|nightlife)/.test(normalized)) {
    return "nightlife";
  }
  if (/(salon|spa|hair|nail)/.test(normalized)) {
    return "salon";
  }
  if (/(cafe|coffee|tea)/.test(normalized)) {
    return "cafe";
  }
  return "general";
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

routes.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

routes.get("/me", verifyFirebaseToken, (req, res) => {
  const { uid } = (req as AuthenticatedRequest).user;
  res.status(200).json({ uid });
});

routes.post("/route-request", verifyFirebaseToken, async (req, res) => {
  const db = getFirestore();
  try {
    const requestId = ensureString(req.body.requestId, "requestId");
    const { uid } = (req as AuthenticatedRequest).user;
    const requestRef = db.collection("requests").doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const requestData = requestSnap.data() as {
      createdByUid?: string;
      rawQuery: string;
      resolvedCategory?: string;
      lat: number;
      lng: number;
      status: string;
    };

    if (requestData.createdByUid !== uid) {
      res.status(403).json({ error: "Not authorized for request" });
      return;
    }

    if (requestData.status !== "broadcasting") {
      res.status(400).json({ error: "Request is not broadcasting" });
      return;
    }

    const resolvedCategory = requestData.resolvedCategory ?? resolveCategory(requestData.rawQuery);
    const businessesSnapshot = await db
      .collection("businesses")
      .where("category", "==", resolvedCategory)
      .where("isOnline", "==", true)
      .get();

    const batch = db.batch();
    let deliveriesCreated = 0;

    businessesSnapshot.forEach((businessDoc) => {
      const business = businessDoc.data() as {
        lat: number;
        lng: number;
        radiusKm: number;
      };

      const distance = distanceKm(
        requestData.lat,
        requestData.lng,
        business.lat,
        business.lng
      );

      if (distance <= business.radiusKm) {
        const deliveryRef = requestRef
          .collection("deliveries")
          .doc(businessDoc.id);
        batch.set(
          deliveryRef,
          { deliveredAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        deliveriesCreated += 1;
      }
    });

    if (requestData.resolvedCategory !== resolvedCategory) {
      batch.set(
        requestRef,
        { resolvedCategory },
        { merge: true }
      );
    }

    await batch.commit();

    res.status(200).json({ deliveriesCreated, resolvedCategory });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

routes.post("/respond-offer", verifyFirebaseToken, async (req, res) => {
  const db = getFirestore();
  try {
    const requestId = ensureString(req.body.requestId, "requestId");
    const businessId = ensureString(req.body.businessId, "businessId");
    const message = ensureString(req.body.message, "message");
    const price = req.body.price;
    const eta = req.body.eta;
    const photoUrls = req.body.photoUrls;

    const { uid } = (req as AuthenticatedRequest).user;
    const businessRef = db.collection("businesses").doc(businessId);
    const requestRef = db.collection("requests").doc(requestId);
    const deliveryRef = requestRef.collection("deliveries").doc(businessId);
    const offersRef = requestRef.collection("offers");
    const offerRef = offersRef.doc();

    await db.runTransaction(async (transaction) => {
      const [businessSnap, requestSnap, deliverySnap] = await Promise.all([
        transaction.get(businessRef),
        transaction.get(requestRef),
        transaction.get(deliveryRef),
      ]);

      if (!businessSnap.exists) {
        throw new Error("Business not found");
      }

      if (!requestSnap.exists) {
        throw new Error("Request not found");
      }

      if (!deliverySnap.exists) {
        throw new Error("Business did not receive delivery");
      }

      const businessData = businessSnap.data() as { ownerUid?: string };
      if (businessData.ownerUid !== uid) {
        throw new Error("Not authorized for business");
      }

      const requestData = requestSnap.data() as { status: string };
      if (requestData.status !== "broadcasting") {
        throw new Error("Request is not open for offers");
      }

      const offerPayload: Record<string, unknown> = {
        businessId,
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (typeof price === "number") {
        offerPayload.price = price;
      }

      if (typeof eta === "string" && eta.trim().length > 0) {
        offerPayload.eta = eta.trim();
      }

      if (Array.isArray(photoUrls)) {
        offerPayload.photoUrls = photoUrls.filter((url) => typeof url === "string");
      }

      transaction.set(offerRef, offerPayload);
    });

    res.status(200).json({ offerId: offerRef.id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

routes.post("/accept-offer", verifyFirebaseToken, async (req, res) => {
  const db = getFirestore();
  try {
    const requestId = ensureString(req.body.requestId, "requestId");
    const offerId = ensureString(req.body.offerId, "offerId");
    const { uid } = (req as AuthenticatedRequest).user;

    const requestRef = db.collection("requests").doc(requestId);
    const offerRef = requestRef.collection("offers").doc(offerId);
    const chatsRef = db.collection("chats");
    const chatRef = chatsRef.doc();

    let acceptedBusinessId = "";

    await db.runTransaction(async (transaction) => {
      const [requestSnap, offerSnap] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(offerRef),
      ]);

      if (!requestSnap.exists) {
        throw new Error("Request not found");
      }

      if (!offerSnap.exists) {
        throw new Error("Offer not found");
      }

      const requestData = requestSnap.data() as {
        createdByUid?: string;
        status: string;
      };

      if (requestData.createdByUid !== uid) {
        throw new Error("Not authorized for request");
      }

      if (requestData.status !== "broadcasting") {
        throw new Error("Request is not accepting offers");
      }

      const offerData = offerSnap.data() as { businessId: string };
      acceptedBusinessId = offerData.businessId;

      const deliveryRef = requestRef.collection("deliveries").doc(acceptedBusinessId);
      const deliverySnap = await transaction.get(deliveryRef);
      if (!deliverySnap.exists) {
        throw new Error("Business did not receive delivery");
      }

      transaction.update(requestRef, {
        status: "accepted",
        acceptedBusinessId,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(chatRef, {
        requestId,
        userId: uid,
        businessId: acceptedBusinessId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({ chatId: chatRef.id, businessId: acceptedBusinessId });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

routes.post("/mark-completed", verifyFirebaseToken, async (req, res) => {
  const db = getFirestore();
  try {
    const requestId = ensureString(req.body.requestId, "requestId");
    const businessId = ensureString(req.body.businessId, "businessId");
    const { uid } = (req as AuthenticatedRequest).user;

    const requestRef = db.collection("requests").doc(requestId);
    const businessRef = db.collection("businesses").doc(businessId);
    const deliveryRef = requestRef.collection("deliveries").doc(businessId);

    await db.runTransaction(async (transaction) => {
      const [requestSnap, businessSnap] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(businessRef),
      ]);

      if (!requestSnap.exists) {
        throw new Error("Request not found");
      }

      if (!businessSnap.exists) {
        throw new Error("Business not found");
      }

      const businessData = businessSnap.data() as { ownerUid?: string };
      if (businessData.ownerUid !== uid) {
        throw new Error("Not authorized for business");
      }

      const deliverySnap = await transaction.get(deliveryRef);
      if (!deliverySnap.exists) {
        throw new Error("Business did not receive delivery");
      }

      const requestData = requestSnap.data() as {
        status: string;
        acceptedBusinessId?: string;
        createdByUid?: string;
      };

      if (requestData.status !== "accepted") {
        throw new Error("Request is not accepted");
      }

      if (requestData.acceptedBusinessId !== businessId) {
        throw new Error("Request not assigned to business");
      }

      transaction.update(requestRef, {
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (requestData.createdByUid) {
        const userRef = db.collection("users").doc(requestData.createdByUid);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data() as { trustScore?: number } | undefined;
        const currentTrust = userData?.trustScore ?? 100;
        const nextTrust = Math.min(100, currentTrust + 2);
        transaction.set(userRef, { trustScore: nextTrust }, { merge: true });
      }
    });

    res.status(200).json({ status: "completed" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

routes.post("/mark-no-show", verifyFirebaseToken, async (req, res) => {
  const db = getFirestore();
  try {
    const requestId = ensureString(req.body.requestId, "requestId");
    const businessId = ensureString(req.body.businessId, "businessId");
    const { uid } = (req as AuthenticatedRequest).user;

    const requestRef = db.collection("requests").doc(requestId);
    const businessRef = db.collection("businesses").doc(businessId);
    const deliveryRef = requestRef.collection("deliveries").doc(businessId);

    await db.runTransaction(async (transaction) => {
      const [requestSnap, businessSnap] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(businessRef),
      ]);

      if (!requestSnap.exists) {
        throw new Error("Request not found");
      }

      if (!businessSnap.exists) {
        throw new Error("Business not found");
      }

      const businessData = businessSnap.data() as { ownerUid?: string };
      if (businessData.ownerUid !== uid) {
        throw new Error("Not authorized for business");
      }

      const deliverySnap = await transaction.get(deliveryRef);
      if (!deliverySnap.exists) {
        throw new Error("Business did not receive delivery");
      }

      const requestData = requestSnap.data() as {
        status: string;
        acceptedBusinessId?: string;
        createdByUid?: string;
        acceptedAt?: admin.firestore.Timestamp;
      };

      if (requestData.status !== "accepted") {
        throw new Error("Request is not accepted");
      }

      if (requestData.acceptedBusinessId !== businessId) {
        throw new Error("Request not assigned to business");
      }

      if (!requestData.acceptedAt) {
        throw new Error("Request acceptance time missing");
      }

      const acceptedAtMs = requestData.acceptedAt.toDate().getTime();
      const nowMs = Date.now();
      const thresholdMs = NO_SHOW_THRESHOLD_MINUTES * 60 * 1000;
      if (nowMs - acceptedAtMs < thresholdMs) {
        throw new Error("No-show threshold not reached");
      }

      transaction.update(requestRef, {
        status: "no_show",
        noShowAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (requestData.createdByUid) {
        const userRef = db.collection("users").doc(requestData.createdByUid);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data() as { trustScore?: number } | undefined;
        const currentTrust = userData?.trustScore ?? 100;
        const nextTrust = Math.max(0, currentTrust - 25);
        transaction.set(userRef, { trustScore: nextTrust }, { merge: true });
      }
    });

    res.status(200).json({ status: "no_show" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
