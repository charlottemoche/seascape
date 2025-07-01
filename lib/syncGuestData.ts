import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export async function syncGuestDataToProfile(userId: string) {
  const [
    onboarded,
    fishName,
    fishColor,
    localHigh,
    localMinutes,
  ] = await Promise.all([
    AsyncStorage.getItem('onboarding_completed'),
    AsyncStorage.getItem('fish_name'),
    AsyncStorage.getItem('fish_color'),
    AsyncStorage.getItem('local_high_score'),
    AsyncStorage.getItem('total_minutes'),
  ]);

  if (!onboarded && !fishName && !fishColor && !localHigh && !localMinutes) {
    return;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('onboarding_completed, fish_name, fish_color, high_score, total_minutes')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.warn('[syncGuestData] profile fetch failed', error);
    return;
  }

  const isFresh =
    profile?.high_score == null &&
    (profile?.total_minutes ?? 0) === 0;

  if (!isFresh) {
    await AsyncStorage.multiRemove([
      'onboarding_completed',
      'fish_name',
      'fish_color',
      'local_high_score',
      'total_minutes',
    ]);
    return;
  }

  const update: Record<string, any> = {};

  if (onboarded === 'true') update.onboarding_completed = true;
  if (fishName) update.fish_name = fishName;
  if (fishColor) update.fish_color = fishColor;
  if (localHigh) update.high_score = Number(localHigh);
  if (localMinutes) update.total_minutes = Number(localMinutes);

  if (Object.keys(update).length) {
    await supabase.from('profiles').update(update).eq('user_id', userId);
  }

  await AsyncStorage.multiRemove([
    'onboarding_completed',
    'fish_name',
    'fish_color',
    'local_high_score',
    'total_minutes',
  ]);
}