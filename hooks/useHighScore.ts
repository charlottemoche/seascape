import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

const LOCAL_HS = 'local_high_score';

export async function bumpHighScore(score: number) {
  const prev = Number(await AsyncStorage.getItem(LOCAL_HS)) || 0;
  if (score > prev) {
    await AsyncStorage.setItem(LOCAL_HS, String(score));
  }
}

export function useSyncAndRefresh(
  refreshProfileQuiet: () => Promise<void>,
  userId?: string,
) {
  useEffect(() => {
    if (!userId) return;

    const trySync = async () => {
      if (!(await NetInfo.fetch()).isConnected) return;

      const localHS = Number(await AsyncStorage.getItem(LOCAL_HS)) || 0;
      if (!localHS) return;

      const { error } = await supabase.rpc('upsert_high_score', {
        p_user: userId,
        p_score: localHS,
      });

      if (!error) {
        await AsyncStorage.removeItem(LOCAL_HS);
        await refreshProfileQuiet();
      } else {
        console.warn('[high-score sync] failed:', error.message);
      }
    };

    trySync();
    const sub = NetInfo.addEventListener(s => {
      if (s.isConnected) trySync();
    });
    return () => sub();
  }, [userId, refreshProfileQuiet]);
}