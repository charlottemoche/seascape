import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '@/context/SessionContext';
import { useStreaks } from '@/context/StreakContext';
import { useAudioPlayer } from 'expo-audio';
import { updateStreak } from '@/lib/streakService';
import { Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { supabase } from '@/lib/supabase';
import { Vibration } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BreatheScreen() {
  const { user, loading, refreshProfileQuiet } = useSession();
  const { refreshStreaks } = useStreaks();


  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const player = useAudioPlayer(require('@/assets/sounds/bowl.mp3'));
  const isLoggedIn = !!user;
  const shownRef = useRef(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useFocusEffect(
    useCallback(() => {
      if (shownRef.current) return;
      shownRef.current = true;
      Alert.alert('Check mute switch', 'Make sure your phone is not on silent to hear the session end.');
    }, [])
  );

  const handleBreathComplete = () => {
    setSessionComplete(true);
    setIsRunning(false);
    player.loop = true;
    player.play();
    Vibration.vibrate([0, 500, 300, 500], true);
  };

  const handleSessionEnd = async (duration: number) => {
    Vibration.cancel();
    player.pause();
    player.seekTo(0);
    player.loop = false;

    if (isLoggedIn) {
      const { error } = await supabase
        .from('breaths')
        .insert({ user_id: user!.id, duration });

      if (error) {
        Alert.alert('Error', 'Failed to save session');
        console.error(error);
        return;
      }

      try {
        const result = await updateStreak(user!.id, 'breath', userTimezone, duration);
        if (result.success) {
          Alert.alert('Success', 'Breathing session saved.');
          await Promise.all([refreshStreaks(), refreshProfileQuiet()]);
        }
      } catch (e) {
        console.error('Unexpected error updating breath streak:', e);
      }
    } else {
      await AsyncStorage.setItem('has_breathed', 'true');
      const totalMinutes = Number(await AsyncStorage.getItem('total_minutes')) || 0;
      await AsyncStorage.setItem('total_minutes', (totalMinutes + duration).toString());
      Alert.alert('Success', 'Breathing session saved.');
    }

    setSessionComplete(false);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/wave.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={[styles.top, !isRunning && !sessionComplete && styles.centerInstruction]}>
          {isRunning || sessionComplete ? (
            <BreatheCircle sessionComplete={sessionComplete} />
          ) : (
            <Text style={styles.instruction}>
              Choose a duration and press start to begin your breathing session.
            </Text>
          )}
        </View>

        <View style={styles.bottom}>
          <BreatheTimer
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            sessionComplete={sessionComplete}
            setSessionComplete={setSessionComplete}
            onComplete={handleBreathComplete}
            onSessionEnd={handleSessionEnd}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.transparent,
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 31, 51, 0.7)',
  },
  bottom: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInstruction: {
    justifyContent: 'center',
    paddingTop: 0,
  },
  instruction: {
    color: Colors.custom.lightBlue,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 40,
  },
});