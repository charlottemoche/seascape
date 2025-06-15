import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useStreaks(userId: string | undefined) {
  const [breathStreak, setBreathStreak] = useState<number | null>(null);
  const [journalStreak, setJournalStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStreaks = async () => {
      const { data: breathData, error: breathError } = await supabase.rpc('refresh_breath_streak', { uid: userId });
      const { data: journalData, error: journalError } = await supabase.rpc('refresh_journal_streak', { uid: userId });

      if (breathError || journalError) {
        console.error('Error fetching streaks:', breathError || journalError);
        setBreathStreak(0);
        setJournalStreak(0);
      } else {
        setBreathStreak(breathData ?? 0);
        setJournalStreak(journalData ?? 0);
      }
    };

    fetchStreaks();
  }, [userId]);

  return { breathStreak, journalStreak };
}