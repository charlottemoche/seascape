import { supabase } from '@/lib/supabase';

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function fetchStreaks(userId: string, userTimezone: string) {
  if (!userId) return { breathStreak: 0, journalStreak: 0 };

  const { data: breathData, error: breathError } = await supabase.rpc('refresh_breath_streak', { uid: userId, user_timezone: userTimezone });
  const { data: journalData, error: journalError } = await supabase.rpc('refresh_journal_streak', { uid: userId, user_timezone: userTimezone });

  if (breathError || journalError) {
    console.error('Error fetching streaks:', breathError || journalError);
    return { breathStreak: 0, journalStreak: 0 };
  }

  return {
    breathStreak: breathData ?? 0,
    journalStreak: journalData ?? 0,
  };
}

export async function updateStreak(userId: string, type: 'journal' | 'breath', userTimezone: string) {
  const rpcName = type === 'journal' ? 'refresh_journal_streak' : 'refresh_breath_streak';
  const { data, error } = await supabase.rpc(rpcName, { uid: userId, user_timezone: userTimezone });
  if (error) {
    console.error('[updateStreak] RPC error:', error);
  }
  return data;
}

export async function fetchLastEntryDates(userId: string) {
  if (!userId) return { lastBreathDate: null, lastJournalDate: null };

  const { data: lastBreath, error: breathError } = await supabase
    .from('breaths')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lastJournal, error: journalError } = await supabase
    .from('journal_entries')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (breathError || journalError) {
    console.error('Error fetching last entry dates:', breathError || journalError);
    return { lastBreathDate: null, lastJournalDate: null };
  }

  return {
    lastBreathDate: lastBreath?.created_at ?? null,
    lastJournalDate: lastJournal?.created_at ?? null,
  };
}