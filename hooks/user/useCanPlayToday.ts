import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function isToday(dateString: string | undefined | null) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

export function useCanPlayToday(userId: string | undefined) {
  const [canPlay, setCanPlay] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) {
      setCanPlay(false);
      return;
    }

    const fetchLatestStreaks = async () => {
      try {
        const { data: breathStreak, error: breathError } = await supabase
          .from('streaks')
          .select('end_date')
          .eq('user_id', userId)
          .eq('type', 'breath')
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: journalStreak, error: journalError } = await supabase
          .from('streaks')
          .select('end_date')
          .eq('user_id', userId)
          .eq('type', 'journal')
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (breathError || journalError) {
          console.error('Error fetching streaks:', breathError || journalError);
          setCanPlay(false);
          return;
        }

        const breathDoneToday = isToday(breathStreak?.end_date);
        const journalDoneToday = isToday(journalStreak?.end_date);

        setCanPlay(breathDoneToday && journalDoneToday);
      } catch (error) {
        console.error('Error fetching streaks:', error);
        setCanPlay(false);
      }
    };

    fetchLatestStreaks();
  }, [userId]);

  return canPlay;
}