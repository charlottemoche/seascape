import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

export async function registerForPushAsync(userId: string) {
  try {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    console.warn('[push] register failed:', err);
  }
}