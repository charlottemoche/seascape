import { supabase } from '@/lib/supabase';


// Fetches today's play count for the given user.
export async function getPlayCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('play_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching play count:', error);
    return 0;
  }

  return data?.count ?? 0;
}

/**
 * Increments today's play count for the given user using the
 * `increment_play_count` Postgres function.
 */
export async function incrementPlayCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('increment_play_count', {
    uid: userId,
    play_date: today,
  });

  console.log('New play count:', data?.count);

  if (error) {
    console.error('Error incrementing play count:', error);
    return 0;
  }

  return data?.count ?? 0;
}