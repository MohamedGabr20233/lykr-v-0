"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store, loadState } from "./index";
import { hydrateState } from "./slices/onboardingSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false);

  useEffect(() => {
    // Only hydrate once on client mount
    if (!hydrated.current) {
      const savedState = loadState();
      if (savedState?.onboarding) {
        store.dispatch(hydrateState(savedState.onboarding));
      }
      hydrated.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
