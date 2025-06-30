import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Context = {
  done: boolean | null;
  markDone: () => Promise<void>;
};

const OnboardingContext = createContext<Context | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_completed')
      .then(v => setDone(v === 'true'))
      .catch(() => setDone(false));
  }, []);

  const markDone = useCallback(async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
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
  if (!context) throw new Error('useOnboarding must be inside <OnboardingProvider>');
  return context;
}