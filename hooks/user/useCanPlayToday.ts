import { useState, useEffect } from 'react';
import { useStreaks } from '@/context/StreakContext';
import { getPlayCount } from '@/lib/playCount';

function isToday(dateString?: string | null) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useCanPlay(userId?: string | null) {
  const { breathStreakDate, journalStreakDate } = useStreaks();
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

    async function fetchPlayCount() {
      setLoading(true);
      try {
        const count = await getPlayCount(userId!);
        setPlayCount(count);
        setPlayCountLoaded(true);
      } catch (e) {
        console.error('Failed fetching play count:', e);
        setPlayCount(0);
        setPlayCountLoaded(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayCount();
  }, [userId]);

  const prerequisitesMet = isToday(breathStreakDate) && isToday(journalStreakDate);
  const hasPlaysLeft = playCount !== null && playCount < 3;
  const canPlay = prerequisitesMet && hasPlaysLeft;

  return { canPlay, loading, playCount, playCountLoaded, setPlayCount };
}