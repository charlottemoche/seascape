import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

const LOCAL_HS = 'localHighScore';

export async function bumpHighScore(score: number) {
  const prev = Number(await AsyncStorage.getItem(LOCAL_HS)) || 0;
  if (score > prev) await AsyncStorage.setItem(LOCAL_HS, String(score));
}

export function useLightSync(userId?: string, onSyncSuccess?: () => void) {
  useEffect(() => {
    if (!userId) return;

    const trySync = async () => {
      const online = (await NetInfo.fetch()).isConnected;
      if (!online) return;

      const localHS = Number(await AsyncStorage.getItem(LOCAL_HS)) || 0;
      if (localHS) {
        const { error } = await supabase.rpc('upsert_high_score', {
          p_user: userId,
          p_score: localHS,
        });
        if (!error) {
          await AsyncStorage.removeItem(LOCAL_HS);
          onSyncSuccess?.();
        }
      }
    };

    trySync();
    const sub = NetInfo.addEventListener((state) => {
      if (state.isConnected) trySync();
    });

    return () => sub();
  }, [userId, onSyncSuccess]);
}