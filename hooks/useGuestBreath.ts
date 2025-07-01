import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useGuestBreath() {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [didToday, setDidToday] = useState(false);

  const refresh = useCallback(async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const last = await AsyncStorage.getItem('last_breathed_active');
    const minutes = Number(await AsyncStorage.getItem('total_minutes')) || 0;

    setDidToday(last === today);
    setTotalMinutes(minutes);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (isActive) await refresh();
      })();
      return () => {
        isActive = false;
      };
    }, [refresh])
  );

  const recordSession = async (duration: number) => {
    const today = new Date().toLocaleDateString('en-CA');
    const newTotal = totalMinutes + duration;

    await AsyncStorage.multiSet([
      ['last_breathed_active', today],
      ['total_minutes', String(newTotal)],
    ]);

    setDidToday(true);
    setTotalMinutes(newTotal);
  };

  return { totalMinutes, didToday, refresh, recordSession };
}