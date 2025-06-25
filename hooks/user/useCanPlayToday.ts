import { useEffect, useState, useMemo } from 'react';
import { getPlayCount, resetPlayCount, incrementPlayCount } from '@/lib/playCount';
import { useStreaks } from '@/context/StreakContext';

export function useCanPlay() {
  const { didBreathe, didJournal, lastActive } = useStreaks();

  const [count, setCount] = useState<number>(0);
  const [loading, setLoad]  = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const c = await getPlayCount();
      if (!cancel) { setCount(c); setLoad(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const bump = async () => setCount(await incrementPlayCount());
  const reset = async () => { await resetPlayCount(); setCount(0); };

  const didOneToday = useMemo(() => {
    if (!lastActive) return false;
    const today = new Date().toLocaleDateString('en-CA');
    return today === lastActive && (didBreathe || didJournal);
  }, [lastActive, didBreathe, didJournal]);

  const canPlay = didOneToday && (count ?? 0) < 3;

  return { canPlay, loading, count, setCount, bump, reset };
}
