import { supabase } from '@/lib/supabase';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export async function updateStreak(userId: string, type: 'journal' | 'breath') {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data: latest, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[updateStreak] Fetch error:', error);
    return;
  }

  if (!latest) {
    // First streak ever
    await supabase.from('streaks').insert({
      user_id: userId,
      type,
      start_date: todayStr,
      end_date: todayStr,
      length: 1,
    });
    return;
  }

  const endDate = parseISO(latest.end_date);
  const daysSince = differenceInCalendarDays(today, endDate);

  if (daysSince === 0) {
    // Already logged today → do nothing
    return;
  } else if (daysSince === 1) {
    // Continue streak
    await supabase
      .from('streaks')
      .update({
        end_date: todayStr,
        length: latest.length + 1,
      })
      .eq('id', latest.id);
  } else {
    // Broken streak → new one
    await supabase.from('streaks').insert({
      user_id: userId,
      type,
      start_date: todayStr,
      end_date: todayStr,
      length: 1,
    });
  }
}