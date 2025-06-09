import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BreatheCircle from '@/components/Breathe/BreatheCircle';
import BreatheTimer from '@/components/Breathe/BreatheTimer';
import { supabase } from '@/utils/supabase';
import Colors from '@/constants/Colors';

export default function BreatheScreen() {
  const [isRunning, setIsRunning] = useState(false);

  const handleBreathComplete = async (duration: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to track this session.');
      return;
    }

    const { error } = await supabase.from('breaths').insert({
      user_id: user.id,
      duration,
    });

    if (error) {
      alert('Error saving session');
      console.error(error);
    } else {
      console.info('Breathing session saved!');
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
});