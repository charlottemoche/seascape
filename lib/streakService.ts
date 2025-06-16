import { supabase } from '@/lib/supabase';

export async function fetchStreaks(userId: string, userTimezone: string) {
  if (!userId) return { breathStreak: 0, journalStreak: 0, breathStreakDate: null, journalStreakDate: null };

  const { data: breathData, error: breathError } = await supabase.rpc('refresh_breath_streak', { uid: userId, user_timezone: userTimezone });
  const { data: journalData, error: journalError } = await supabase.rpc('refresh_journal_streak', { uid: userId, user_timezone: userTimezone });

  if (breathError || journalError) {
    console.error('Error fetching streaks:', breathError || journalError);
    return { breathStreak: 0, journalStreak: 0, breathStreakDate: null, journalStreakDate: null };
  }

  return {
    breathStreak: breathData?.[0]?.streak_count ?? 0,
    breathStreakDate: breathData?.[0]?.streak_end_date ?? null,
    journalStreak: journalData?.[0]?.streak_count ?? 0,
    journalStreakDate: journalData?.[0]?.streak_end_date ?? null,
  };
}

export async function updateStreak(userId: string, type: 'journal' | 'breath', userTimezone: string) {
  const rpcName = type === 'journal' ? 'refresh_journal_streak' : 'refresh_breath_streak';
  const { error } = await supabase.rpc(rpcName, { uid: userId, user_timezone: userTimezone });
  if (error) {
    console.error('[updateStreak] RPC error:', error);
  }
}