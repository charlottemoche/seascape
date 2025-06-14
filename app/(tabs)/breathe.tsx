import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { updateStreak } from '@/lib/streakService';
import { useStreaks } from '@/context/StreakContext';
import { ActivityIndicator } from 'react-native';

export default function BreatheScreen() {
  const { user, loading } = useRequireAuth();
  const { refreshStreaks } = useStreaks();
  const [isRunning, setIsRunning] = useState(false);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.custom.lightBlue} />
      </View>
    );
  }

  if (!user) return null;

  const handleBreathComplete = async (duration: number) => {
    if (!user) return;

    const { error } = await supabase.from('breaths').insert({
      user_id: user.id,
      duration,
    });

    if (error) {
      alert('Error saving session');
      console.error(error);
    } else {
      console.info('Breathing session saved!');
      await updateStreak(user.id, 'breath');
      await refreshStreaks();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/wave.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={[styles.top, !isRunning && styles.centerInstruction]}>
          {isRunning ? (
            <BreatheCircle />
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
            onComplete={handleBreathComplete}
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
  loading: {
    backgroundColor: Colors.custom.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});