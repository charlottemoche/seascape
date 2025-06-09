import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export function useUserStats(userId: string | null) {
  const [journalStreak, setJournalStreak] = useState<number>(0);
  const [breathStreak, setBreathStreak] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);

      const { data: streaks } = await supabase
        .from('streaks')
        .select('type')
        .eq('user_id', userId);

      if (streaks) {
        setJournalStreak(streaks.filter(s => s.type === 'journal').length || 0);
        setBreathStreak(streaks.filter(s => s.type === 'breath').length || 0);
      }

      const { data: breaths } = await supabase
        .from('breaths')
        .select('duration')
        .eq('user_id', userId);

      if (breaths) {
        const total = breaths.reduce((sum, row) => sum + row.duration, 0);
        setTotalMinutes(total || 0);
      }

      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  return { journalStreak, breathStreak, totalMinutes, loading };
}