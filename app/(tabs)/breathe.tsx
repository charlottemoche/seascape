import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import { supabase } from '@/lib/supabase';
import { updateStreak } from '@/hooks/user/updateStreak';
import Colors from '@/constants/Colors';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { ActivityIndicator } from 'react-native';

export default function BreatheScreen() {
  const { user, loading } = useRequireAuth();
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
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    justifyContent: 'space-between',
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