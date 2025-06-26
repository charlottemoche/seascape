import { supabase } from '@/lib/supabase';
import type { JournalEntryRaw } from '@/types/Journal';

export async function fetchFeelings(userId: string, range: '1W' | '1M' | '3M' | '6M' = '1W'): Promise<JournalEntryRaw[]> {
  const timeRanges = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
  };

  const fromDate = new Date(Date.now() - timeRanges[range] * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('journal_entries')
    .select('created_at, feeling')
    .eq('user_id', userId)
    .gte('created_at', fromDate);

  if (error) {
    console.error('[fetchFeelings] error:', error);
    throw error;
  }

  return data as JournalEntryRaw[];
}