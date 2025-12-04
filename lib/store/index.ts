import { configureStore } from "@reduxjs/toolkit";
import onboardingReducer from "./slices/onboardingSlice";
import type { OnboardingState } from "@/app/types/onboarding";

const STORAGE_KEY = "lykr_onboarding_state";

// Save state to sessionStorage
export const saveState = (state: { onboarding: OnboardingState }) => {
  if (typeof window === "undefined") return;

  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving state to sessionStorage:", err);
  }
};

// Load state from sessionStorage
export const loadState = (): { onboarding: OnboardingState } | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const serializedState = sessionStorage.getItem(STORAGE_KEY);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from sessionStorage:", err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
  },
});

// Subscribe to store changes and save to sessionStorage
if (typeof window !== "undefined") {
  store.subscribe(() => {
    saveState({
      onboarding: store.getState().onboarding,
    });
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
