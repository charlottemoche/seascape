import { supabase } from '@/lib/supabase';

export async function fetchStreaks(
  userId: string,
  userTimezone: string
) {
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

  const today = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone });
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA', {
    timeZone: userTimezone,
  });

  const { data: row, error } = await supabase
    .from('user_streaks')
    .select('last_journal, journal_streak, last_breathe, breath_streak')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[fetchStreaks] error:', error);
    return {
      success: false,
      lastActive: null,
      didJournal: false,
      didBreathe: false,
      journalStreak: 0,
      breathStreak: 0,
    };
  }

  const lastJournal = row?.last_journal ?? null;
  const lastBreathe = row?.last_breathe ?? null;

  const didJournal = lastJournal === today;
  const didBreathe = lastBreathe === today;

  const journalActive = lastJournal === today || lastJournal === yesterday;
  const breathActive  = lastBreathe === today || lastBreathe === yesterday;

  return {
    success: true,
    lastActive: lastJournal && lastBreathe
      ? (lastJournal > lastBreathe ? lastJournal : lastBreathe)
      : (lastJournal ?? lastBreathe),
    didJournal,
    didBreathe,
    journalStreak: journalActive ? row?.journal_streak ?? 0 : 0,
    breathStreak:  breathActive  ? row?.breath_streak  ?? 0 : 0,
  };
}

export async function updateStreak(
  userId: string,
  type: 'journal' | 'breath',
  userTimezone: string,
  newMinutes = 0
) {
  const { data, error } = await supabase.rpc('bump_streak', {
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
    journalStreak: data?.[0]?.journal_streak ?? 0,
    breathStreak:  data?.[0]?.breath_streak  ?? 0,
  };
}