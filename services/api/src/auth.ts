import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAuth } from "./firestore";

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Missing Firebase ID token" });
    return;
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Firebase ID token" });
  }
};
