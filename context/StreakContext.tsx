import React, {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { fetchStreaks } from '@/lib/streakService';
import { useUser } from './UserContext';

type StreakContextType = {
  streakLength: number;
  lastActive?: string | null;
  didJournal: boolean;
  didBreathe: boolean;
  journalStreak: number;
  breathStreak: number;
  refreshStreaks: () => Promise<void>;
  streaksLoading: boolean;
};

const StreakContext = createContext<StreakContextType>({
  streakLength: 0,
  lastActive: null,
  didJournal: false,
  didBreathe: false,
  journalStreak: 0,
  breathStreak: 0,
  refreshStreaks: async () => { },
  streaksLoading: true,
});

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const userId = user?.id;

  const [streakLength, setStreakLength] = useState(0);
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [didJournal, setDidJournal] = useState(false);
  const [didBreathe, setDidBreathe] = useState(false);
  const [journalStreak, setJournalStreak] = useState(0);
  const [breathStreak, setBreathStreak] = useState(0);
  const [streaksLoading, setStreaksLoading] = useState(true);


  const refreshStreaks = useCallback(async () => {
    if (!userId) {
      console.warn('[refreshStreaks] No user ID');
      setStreaksLoading(false);
      return;
    }

    setStreaksLoading(true);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const result = await fetchStreaks(userId, userTimezone);

      if (!result.success) {
        console.error('Streak fetch failed');
        return;
      }

      setStreakLength(result.streakLength);
      setLastActive(result.lastActive);
      setDidJournal(result.didJournal);
      setDidBreathe(result.didBreathe);
      setJournalStreak(result.journalStreak);
      setBreathStreak(result.breathStreak);

    } catch (e) {
      console.error('[refreshStreaks] Unexpected error:', e);
    } finally {
      setStreaksLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refreshStreaks();
  }, [refreshStreaks, userId]);

  const contextValue = useMemo(
    () => ({
      streakLength,
      lastActive,
      didJournal,
      didBreathe,
      journalStreak,
      breathStreak,
      refreshStreaks,
      streaksLoading,
    }),
    [
      streakLength,
      lastActive,
      didJournal,
      didBreathe,
      journalStreak,
      breathStreak,
      refreshStreaks,
      streaksLoading,
    ]
  );

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