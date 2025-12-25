import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { writable } from "svelte/store";
import { auth } from "./firebase";
import { registerPushToken } from "./push";

export const currentUser = writable<User | null>(auth.currentUser);

onAuthStateChanged(auth, (user) => {
  currentUser.set(user);

  if (user) {
    user
      .getIdToken()
      .then((token) => registerPushToken(token))
      // eslint-disable-next-line no-console
      .catch((error) => console.warn("Failed to register push token", error));
  }
});

export const createRecaptchaVerifier = (
  containerId: string,
  options: { size?: "invisible" | "compact" | "normal" } = {
    size: "invisible",
  }
): RecaptchaVerifier => new RecaptchaVerifier(auth, containerId, options);

export const requestPhoneOtp = (
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> => signInWithPhoneNumber(auth, phoneNumber, verifier);

export const confirmPhoneOtp = (
  confirmation: ConfirmationResult,
  code: string
) => confirmation.confirm(code);

export const signOutUser = () => signOut(auth);
