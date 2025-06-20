import { supabase } from '@/lib/supabase';

export async function fetchStreaks(userId: string, userTimezone: string) {
  if (!userId) {
    return {
      success: false,
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
    .select('last_active, did_journal, did_breathe, journal_streak, breath_streak')
    .eq('user_id', userId)
    .eq('date', localDate)
    .single();

  if (todayError && todayError.code !== 'PGRST116') {
    console.error('[fetchStreaks] error:', todayError);
    return {
      success: false,
      lastActive: null,
      didJournal: false,
      didBreathe: false,
      journalStreak: 0,
      breathStreak: 0,
    };
  }

  return {
    success: true,
    lastActive: todayRow?.last_active ?? null,
    didJournal: todayRow?.did_journal ?? false,
    didBreathe: todayRow?.did_breathe ?? false,
    journalStreak: todayRow?.journal_streak ?? 0,
    breathStreak: todayRow?.breath_streak ?? 0,
  };
}

export async function updateStreak(
  userId: string,
  type: 'journal' | 'breath',
  userTimezone: string,
  newMinutes: number = 0
) {
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
    lastActive: data?.[0]?.last_active ?? null,
  };
}