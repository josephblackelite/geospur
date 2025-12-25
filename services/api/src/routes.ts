import { Router } from "express";
import { type AuthenticatedRequest, verifyFirebaseToken } from "./auth";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

routes.get("/me", verifyFirebaseToken, (req, res) => {
  const { uid } = (req as AuthenticatedRequest).user;
  res.status(200).json({ uid });
});
