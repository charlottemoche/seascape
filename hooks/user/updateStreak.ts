import { supabase } from '@/lib/supabase';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export async function updateStreak(userId: string, type: 'journal' | 'breath') {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const profileColumn = type === 'journal' ? 'journal_streak' : 'breath_streak';

  console.log(`[updateStreak] Called with userId=${userId}, type=${type}`);

  // 1. Get most recent streak
  const { data: streak, error: streakError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (streakError) {
    console.error('[updateStreak] Error fetching streak:', streakError);
    return;
  }

  let currentStreakLength = 0;

  if (streak) {
    const endDate = parseISO(streak.end_date);
    const daysSinceLast = differenceInCalendarDays(today, endDate);

    if (daysSinceLast === 0) {
      console.log('[updateStreak] Already logged today — updating profiles streak with existing length');
      const { error } = await supabase
        .from('profiles')
        .update({ [profileColumn]: streak.length })
        .eq('user_id', userId);

      if (error) {
        console.error('[updateStreak] Error updating profile streak (same day):', error);
      }
      return;
    } else if (daysSinceLast === 1) {
      console.log('[updateStreak] Continue streak: updating streak length');
      const { error } = await supabase
        .from('streaks')
        .update({
          end_date: todayStr,
          length: streak.length + 1,
        })
        .eq('id', streak.id);

      if (error) {
        console.error('[updateStreak] Error updating streak:', error);
        return;
      }
      currentStreakLength = streak.length + 1;
    } else {
      console.log('[updateStreak] Streak broken — inserting new streak');
      const { error } = await supabase.from('streaks').insert({
        user_id: userId,
        type,
        start_date: todayStr,
        end_date: todayStr,
        length: 1,
      });
      if (error) {
        console.error('[updateStreak] Error inserting new streak:', error);
        return;
      }
      currentStreakLength = 1;
    }
  } else {
    console.log('[updateStreak] No streak yet — inserting first streak');
    const { error } = await supabase.from('streaks').insert({
      user_id: userId,
      type,
      start_date: todayStr,
      end_date: todayStr,
      length: 1,
    });
    if (error) {
      console.error('[updateStreak] Error inserting first streak:', error);
      return;
    }
    currentStreakLength = 1;
  }

  console.log(`[updateStreak] Updating profile streak ${profileColumn} to ${currentStreakLength}`);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ [profileColumn]: currentStreakLength })
    .eq('user_id', userId);

  if (profileError) {
    console.error('[updateStreak] Error updating profile streak:', profileError);
  }
}