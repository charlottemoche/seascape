import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, Dimensions, Easing, Animated } from 'react-native';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useStreaks } from '@/context/StreakContext';
import { useProfile } from '@/context/ProfileContext';
import { useAudioPlayer } from 'expo-audio';
import { updateStreak } from '@/lib/streakService';
import { Text } from '@/components/Themed';
import { Loader } from '@/components/Loader';
import { supabase } from '@/lib/supabase';
import { Vibration } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import Colors from '@/constants/Colors';
import waves from '@/assets/images/waves.png';

const WAVE = waves;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const translateX = new Animated.Value(0);

export default function BreatheScreen() {
  const { user, loading } = useRequireAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const player = useAudioPlayer(require('@/assets/sounds/bowl.mp3'));
  const { refreshStreaks } = useStreaks();
  const { refreshProfile } = useProfile();

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!user) return null;

  useEffect(() => {
    Alert.alert(
      'Check mute switch',
      'Make sure your phone is not on silent to hear the session end.'
    );
  }, []);

  useEffect(() => {
    if (isRunning || sessionComplete) {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -SCREEN_WIDTH,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      translateX.stopAnimation();
      translateX.setValue(0);
    }
  }, [isRunning, sessionComplete]);

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

    const { error } = await supabase.from('breaths').insert({
      user_id: user.id,
      duration,
    });

    if (error) {
      alert('Error saving session');
      console.error(error);
      return;
    }

    try {
      const result = await updateStreak(user.id, 'breath', userTimezone, duration);
      if (result.success) {
        Alert.alert('Success', 'Breathing session saved.');
        Promise.all([refreshStreaks(), refreshProfile({ silent: true })]);
      } else {
        console.warn('Breath streak update failed, skipping refresh');
      }
    } catch (e) {
      console.error('Unexpected error updating breath streak:', e);
    }

    setSessionComplete(false);
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <Animated.View
        style={{
          flexDirection: 'row',
          width: SCREEN_WIDTH * 2,
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: [{ translateX }],
        }}
      >
        <Image
          source={WAVE}
          style={{ width: SCREEN_WIDTH + 1, height: '100%' }}
          resizeMode="cover"
        />
        <Image
          source={WAVE}
          style={{
            width: SCREEN_WIDTH + 1,
            height: '100%',
            transform: [{ scaleX: -1 }],
            marginLeft: -1,
          }}
          resizeMode="cover"
        />
      </Animated.View>

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
    backgroundColor: 'rgba(2, 31, 63, 0.5)',
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