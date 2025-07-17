import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Context = {
  done: boolean | null;
  markDone: () => Promise<void>;
};

const OnboardingContext = createContext<Context | undefined>(undefined);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync("onboarding_completed");
      setDone(raw === "true");
    })();
  }, []);

  const markDone = useCallback(async () => {
    await SecureStore.setItemAsync("onboarding_completed", "true");
    setDone(true);
  }, []);

  return (
    <OnboardingContext.Provider value={{ done, markDone }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be inside <OnboardingProvider>");
  return context;
}
