import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useStreaks(userId: string | undefined) {
  const [breathStreak, setBreathStreak] = useState<number | null>(null);
  const [journalStreak, setJournalStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStreak = async (type: 'breath' | 'journal', setter: (val: number) => void) => {
      const { data } = await supabase
        .from('streaks')
        .select('length')
        .eq('user_id', userId)
        .eq('type', type)
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.length) setter(data.length);
      else setter(0);
    };

    fetchStreak('breath', setBreathStreak);
    fetchStreak('journal', setJournalStreak);
  }, [userId]);

  return { breathStreak, journalStreak };
}
