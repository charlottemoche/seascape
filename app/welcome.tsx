import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FishCustomizer } from '@/components/FishCustomizer';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { Logo } from '@/components/Nav/Logo';
import Colors from '@/constants/Colors';

const slides = [
  {
    key: 'welcome',
    content: 'Your personal companion for meditation and mindfulness.',
  },
  {
    key: 'breathing',
    content: 'Practice calming breathing exercises to relax your mind and body.',
  },
  {
    key: 'journaling',
    content: 'Write journal entries to reflect on your thoughts and emotions.',
  },
  {
    key: 'tracking',
    content: 'Keep track of your meditation minutes, daily streaks, and journaling habits.',
  },
  {
    key: 'game',
    content: 'Enjoy a relaxing fish game as a reward for your mindfulness progress!',
  },
  {
    key: 'customize',
    content: '',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const { user } = useUser();

  const [page, setPage] = useState(0);

  const isFirstPage = page === 0;
  const isLastPage = page === slides.length - 1;

  const onNext = async () => {
    if (!isLastPage) {
      setPage((prev) => prev + 1);
    } else {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Onboarding complete error:', error);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        return;
      }

      await refreshProfile();
      router.replace('/');
    }
  };

  const onBack = () => {
    if (!isFirstPage) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/wave.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Logo />
        <View style={styles.content}>
          {isFirstPage && (
            <Text style={styles.header}>Welcome to Current</Text>
          )}
          {slides[page].key === 'customize' ? (
            <FishCustomizer />
          ) : (
            <Text style={styles.text}>{slides[page].content}</Text>
          )}
        </View>

        <View style={styles.buttons}>
          {!isFirstPage && (
            <Button title="Back" onPress={onBack} color={Colors.custom.blue} />
          )}
          <View style={styles.nextButtonWrapper}>
            <Button
              title={isLastPage ? 'Continue' : 'Next'}
              onPress={onNext}
              color={Colors.custom.lightBlue}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: Colors.custom.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 31, 51, 0.5)',
  },
  customizeContainer: {
    backgroundColor: Colors.custom.background,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  header: {
    color: Colors.custom.white,
    fontSize: 32,
    lineHeight: 40,
    paddingBottom: 8,
    textAlign: 'center',
    fontWeight: 500,
  },
  text: {
    color: Colors.custom.white,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: Colors.custom.background
  },
  nextButtonWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
});