import { browser } from "$app/environment";
import { writable } from "svelte/store";

type Role = "consumer" | "business";

const STORAGE_KEY = "geospur-role";

const getInitialRole = (): Role => {
  if (!browser) {
    return "consumer";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "business" || stored === "consumer") {
    return stored;
  }

  return "consumer";
};

const createRoleStore = () => {
  const { subscribe, set } = writable<Role>(getInitialRole());

  return {
    subscribe,
    set: (nextRole: Role) => {
      if (browser) {
        window.localStorage.setItem(STORAGE_KEY, nextRole);
      }
      set(nextRole);
    },
  };
};

export const role = createRoleStore();
export type { Role };
