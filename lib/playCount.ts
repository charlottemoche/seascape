import { supabase } from '@/lib/supabase';

export async function getPlayCount(userId: string): Promise<number> {
  // Get user's local date as YYYY-MM-DD
  const localDate = new Date();
  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  const dd = String(localDate.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

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

export async function incrementPlayCount(userId: string): Promise<number> {
  // Use local device date for consistency
  const localDate = new Date();
  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  const dd = String(localDate.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

  const { data, error } = await supabase.rpc('increment_play_count', {
    uid: userId,
    play_date: today,
  });

  if (error) {
    console.error('Error incrementing play count:', error);
    return 0;
  }

  if (Array.isArray(data) && data.length > 0) {
    return data[0].play_count ?? 0;
  }

  return 0;
}

export async function resetPlayCount(userId: string): Promise<void> {
  const localDate = new Date();
  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  const dd = String(localDate.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

  const { error } = await supabase
    .from('play_counts')
    .update({ play_count: 0 })
    .eq('user_id', userId)
    .eq('date', today);

  if (error) {
    console.error('Error resetting play count:', error);
    throw error;
  }
}