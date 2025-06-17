import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useStreaks } from '@/context/StreakContext';
import { useAudioPlayer } from 'expo-audio';
import { updateStreak } from '@/lib/streakService';
import { Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

export default function BreatheScreen() {
  const { user, loading } = useRequireAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const player = useAudioPlayer(require('@/assets/sounds/bowl.mp3'));
  const { refreshStreaks } = useStreaks();

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!user) return null;

  const handleBreathComplete = () => {
    setSessionComplete(true);
    setIsRunning(false);
    player.loop = true;
    player.play();
  };

  const handleSessionEnd = async (duration: number) => {
    player.pause();
    player.seekTo(0);
    player.loop = false;

    const { error } = await supabase.from('breaths').insert({
      user_id: user.id,
      duration,
    });

    if (error) {
      alert('Error saving session');
      console.error(error);
    } else {
      await updateStreak(user.id, 'breath', userTimezone);
      await refreshStreaks();
    }

    setSessionComplete(false);
  };

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
    backgroundColor: Colors.custom.background,
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