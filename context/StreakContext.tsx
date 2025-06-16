import React, { ReactNode, createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { fetchLastEntryDates, fetchStreaks } from '@/lib/streakService';

type StreakContextType = {
  breathStreak: number;
  journalStreak: number;
  breathStreakDate?: string | null;
  journalStreakDate?: string | null;
  refreshStreaks: () => Promise<void>;
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
  refreshStreaks: async () => { },
});

export const StreakProvider = ({ userId, children }: StreakProviderProps) => {
  const [breathStreak, setBreathStreak] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [breathStreakDate, setBreathStreakDate] = useState<string | null>(null);
  const [journalStreakDate, setJournalStreakDate] = useState<string | null>(null);

  const refreshStreaks = useCallback(async () => {
    if (!userId) return;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { breathStreak, journalStreak } = await fetchStreaks(userId, userTimezone);
    const { lastBreathDate, lastJournalDate } = await fetchLastEntryDates(userId);
    setBreathStreak(breathStreak);
    setJournalStreak(journalStreak);
    setBreathStreakDate(lastBreathDate);
    setJournalStreakDate(lastJournalDate);
  }, [userId]);

  useEffect(() => {
    refreshStreaks();
  }, [refreshStreaks]);

  const contextValue = React.useMemo(() => ({
    breathStreak,
    journalStreak,
    breathStreakDate,
    journalStreakDate,
    refreshStreaks,
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