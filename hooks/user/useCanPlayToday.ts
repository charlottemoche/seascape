import { useState, useEffect, useMemo } from 'react';
import { useStreaks } from '@/context/StreakContext';
import { getPlayCount } from '@/lib/playCount';

function isToday(dateString?: string | null) {
  if (!dateString) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useCanPlay(userId?: string | null) {
  const { didBreathe, didJournal, lastActive } = useStreaks();
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [playCountLoaded, setPlayCountLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPlayCount(null);
      setLoading(false);
      setPlayCountLoaded(false);
      return;
    }

    let isCancelled = false;

    async function fetchPlayCount() {
      setLoading(true);
      try {
        const count = await getPlayCount(userId!);
        if (!isCancelled) {
          setPlayCount(count);
          setPlayCountLoaded(true);
        }
      } catch (e) {
        console.error('Failed fetching play count:', e);
        if (!isCancelled) {
          setPlayCount(0);
          setPlayCountLoaded(true);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchPlayCount();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const canPlay = useMemo(() => {
    const didBothToday = isToday(lastActive) && didBreathe && didJournal;
    const hasPlaysLeft = playCount !== null && playCount < 3;
    return didBothToday && hasPlaysLeft;
  }, [lastActive, didBreathe, didJournal, playCount]);

  return { canPlay, loading, playCount, playCountLoaded, setPlayCount };
}