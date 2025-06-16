import React, { ReactNode, createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { fetchStreaks } from '@/lib/streakService';

type StreakContextType = {
  breathStreak: number;
  journalStreak: number;
  breathStreakDate?: string | null;
  journalStreakDate?: string | null;
  refreshStreaks: () => Promise<void>;
  streaksLoading: boolean;
};

type StreakProviderProps = {
  userId?: string;
  children: ReactNode;
};

const StreakContext = createContext<StreakContextType>({
  breathStreak: 0,
  journalStreak: 0,
  breathStreakDate: null,
  journalStreakDate: null,
  refreshStreaks: async () => {},
  streaksLoading: true,
});

export const StreakProvider = ({ userId, children }: StreakProviderProps) => {
  const [breathStreak, setBreathStreak] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [breathStreakDate, setBreathStreakDate] = useState<string | null>(null);
  const [journalStreakDate, setJournalStreakDate] = useState<string | null>(null);
  const [streaksLoading, setStreaksLoading] = useState(true);

  const refreshStreaks = useCallback(async () => {
    if (!userId) return;
    setStreaksLoading(true);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const {
      breathStreak,
      breathStreakDate,
      journalStreak,
      journalStreakDate,
    } = await fetchStreaks(userId, userTimezone);
    setBreathStreak(breathStreak);
    setBreathStreakDate(breathStreakDate);
    setJournalStreak(journalStreak);
    setJournalStreakDate(journalStreakDate);
    setStreaksLoading(false);
  }, [userId]);
  
  useEffect(() => {
    refreshStreaks();
  }, [refreshStreaks]);

  const contextValue = useMemo(() => ({
    breathStreak,
    journalStreak,
    breathStreakDate,
    journalStreakDate,
    refreshStreaks,
    streaksLoading,
  }), [breathStreak, journalStreak, breathStreakDate, journalStreakDate, refreshStreaks]);

  return (
    <StreakContext.Provider value={contextValue}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreaks = () => {
  const context = useContext(StreakContext);
  if (!context) throw new Error('useStreaks must be used within a StreakProvider');
  return context;
};