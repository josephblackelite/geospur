import { writable } from "svelte/store";

export type UserRole = "consumer" | "business";

export const userRole = writable<UserRole>("consumer");

export const setUserRole = (role: UserRole) => {
  userRole.set(role);
};
