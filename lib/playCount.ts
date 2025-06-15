import { supabase } from '@/lib/supabase';


// Fetches today's play count for the given user.
export async function getPlayCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('play_counts')
    .select('play_count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching play count:', error);
    return 0;
  }

  return data?.play_count ?? 0;
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

  console.log('New play count:', data?.play_count);

  if (error) {
    console.error('Error incrementing play count:', error);
    return 0;
  }

  if (Array.isArray(data) && data.length > 0) {
    return data[0].play_count ?? 0;
  }

  return 0;
}