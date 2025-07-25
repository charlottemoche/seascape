import React, {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { fetchStreaks } from "@/lib/streakService";
import { useSession } from "./SessionContext";

type StreakContextType = {
  lastActive?: string | null;
  didJournal: boolean;
  didBreathe: boolean;
  journalStreak: number;
  breathStreak: number;
  refreshStreaks: () => Promise<void>;
  streaksLoading: boolean;
};

const StreakContext = createContext<StreakContextType>({
  lastActive: null,
  didJournal: false,
  didBreathe: false,
  journalStreak: 0,
  breathStreak: 0,
  refreshStreaks: async () => {},
  streaksLoading: true,
});

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [didJournal, setDidJournal] = useState(false);
  const [didBreathe, setDidBreathe] = useState(false);
  const [journalStreak, setJournalStreak] = useState(0);
  const [breathStreak, setBreathStreak] = useState(0);
  const [streaksLoading, setStreaksLoading] = useState(true);

  const { user } = useSession();
  const userId = user?.id;

  const refreshStreaks = useCallback(async () => {
    if (!userId) return;

    setStreaksLoading(true);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const r = await fetchStreaks(userId, tz);
      if (!r.success) return;

      setLastActive(r.lastActive);
      setDidJournal(r.didJournal);
      setDidBreathe(r.didBreathe);
      setJournalStreak(r.journalStreak);
      setBreathStreak(r.breathStreak);
    } finally {
      setStreaksLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refreshStreaks();
    else setStreaksLoading(false);
  }, [userId, refreshStreaks]);

  const value = useMemo(
    () => ({
      lastActive,
      didJournal,
      didBreathe,
      journalStreak,
      breathStreak,
      refreshStreaks,
      streaksLoading,
    }),
    [
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
    <StreakContext.Provider value={value}>{children}</StreakContext.Provider>
  );
};

export const useStreaks = () => {
  const context = useContext(StreakContext);
  if (!context)
    throw new Error("useStreaks must be used within a StreakProvider");
  return context;
};
