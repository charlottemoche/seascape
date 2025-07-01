import { useEffect, useState, useMemo } from 'react';
import { getPlayCount, resetPlayCount, incrementPlayCount } from '@/lib/playCount';
import { useStreaks } from '@/context/StreakContext';
import { useSession } from '@/context/SessionContext';
import { useGuestBreath } from '@/hooks/useGuestBreath';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useCanPlay() {
  const { didBreathe, didJournal, lastActive } = useStreaks();
  const { user } = useSession();
  const { didToday: didGuestBreatheToday } = useGuestBreath();
  
  const isLoggedIn = !!user;

  const [count, setCount] = useState(0);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const c = await getPlayCount();
      if (!cancel) { setCount(c); setLoad(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const bump  = async () => setCount(await incrementPlayCount());
  const reset = async () => { await resetPlayCount(); setCount(0); };

  const today = new Date().toLocaleDateString('en-CA');

  const didOneToday = useMemo(() => {
    return isLoggedIn
      ? today === lastActive && (didBreathe || didJournal)
      : didGuestBreatheToday;
  }, [
    isLoggedIn,
    today,
    lastActive,
    didBreathe,
    didJournal,
    didGuestBreatheToday,
  ]);

  const canPlay = didOneToday && count < 5;

  return { canPlay, loading, count, setCount, bump, reset };
}