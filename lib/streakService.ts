import { supabase } from '@/lib/supabase';

export async function fetchStreaks(userId: string, userTimezone: string) {
  if (!userId) {
    return {
      success: false,
      streakLength: 0,
      lastActive: null,
      didJournal: false,
      didBreathe: false,
      journalStreak: 0,
      breathStreak: 0,
    };
  }

  const localDate = new Date().toLocaleDateString('en-CA', {
    timeZone: userTimezone,
  });

  const { data: todayRow, error: todayError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', localDate)
    .single();

  if (todayError && todayError.code !== 'PGRST116') {
    console.error('[fetchStreaks] error:', todayError);
    return {
      success: false,
      streakLength: 0,
      lastActive: null,
      didJournal: false,
      didBreathe: false,
      journalStreak: 0,
      breathStreak: 0,
    };
  }

  const { data: historyRows, error: historyError } = await supabase
    .from('streaks')
    .select('date, did_journal, did_breathe')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (historyError) {
    console.error('[fetchStreaks] history error:', historyError);
  }

  function calculateStreak(rows: any[], key: 'did_journal' | 'did_breathe') {
    let streak = 0;
    let currentDate = new Date(localDate);

    for (const row of rows) {
      const rowDate = new Date(row.date);
      const isSameDay = rowDate.toDateString() === currentDate.toDateString();

      if (isSameDay && row[key]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (!isSameDay) {
        // handle if the streak skips a day
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
        if (rowDate.toDateString() === expectedDate.toDateString() && row[key]) {
          streak++;
          currentDate = expectedDate;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  const journalStreak = calculateStreak(historyRows ?? [], 'did_journal');
  const breathStreak = calculateStreak(historyRows ?? [], 'did_breathe');

  return {
    success: true,
    streakLength: todayRow?.streak_length ?? 0,
    lastActive: todayRow?.last_active ?? null,
    didJournal: todayRow?.did_journal ?? false,
    didBreathe: todayRow?.did_breathe ?? false,
    journalStreak,
    breathStreak,
  };
}

export async function updateStreak(userId: string, type: 'journal' | 'breath', userTimezone: string, newMinutes: number = 0) {
  const { data, error } = await supabase.rpc('update_streak', {
    uid: userId,
    type,
    user_timezone: userTimezone,
    new_minutes: newMinutes,
  });

  if (error) {
    console.error('[updateStreak] RPC error:', error);
    return { success: false };
  }

  return {
    success: true,
    streakLength: data?.[0]?.streak_length ?? 0,
    lastActive: data?.[0]?.last_active ?? null,
  };
}