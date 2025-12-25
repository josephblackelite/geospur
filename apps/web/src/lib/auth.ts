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

export const currentUser = writable<User | null>(auth.currentUser);

onAuthStateChanged(auth, (user) => {
  currentUser.set(user);
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
