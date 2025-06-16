import { useState, useEffect, useMemo } from 'react';
import { useStreaks } from '@/context/StreakContext';
import { getPlayCount } from '@/lib/playCount';

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  // month is 0-based in JS Date constructor
  return new Date(year, month - 1, day);
}

function isToday(dateString?: string | null) {
  if (!dateString) return false;
  const date = parseLocalDate(dateString);

  const now = new Date();

  // Normalize both to local midnight
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return dateMidnight.getTime() === nowMidnight.getTime();
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
    const prerequisitesMet = isToday(breathStreakDate) && isToday(journalStreakDate);
    const hasPlaysLeft = playCount !== null && playCount < 3;
    return prerequisitesMet && hasPlaysLeft;
  }, [breathStreakDate, journalStreakDate, playCount]);

  return { canPlay, loading, playCount, playCountLoaded, setPlayCount };
}