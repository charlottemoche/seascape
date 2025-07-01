import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { FishCustomizer } from '@/components/Fish/FishCustomizer';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Nav/Logo';
import { Icon } from '@/components/Icon';
import Slide from '@/components/Slide';
import Colors from '@/constants/Colors';
import wave from '@/assets/images/wave.png';
import { useOnboarding } from '@/context/OnboardingContext';

const WAVE = wave;

const slides = [
  {
    key: 'welcome',
    content: 'Your personal companion for meditation and mindfulness.',
    icon: require('@/assets/images/fish.png'),
  },
  {
    key: 'breathing',
    content: 'Practice calming breathing exercises to relax your mind and body.',
    icon: <Icon name="leaf-outline" color={Colors.custom.green} type="Ionicons" size={28} />,
  },
  {
    key: 'journaling',
    content: 'Write journal entries to reflect on your thoughts and emotions.',
    icon: <Icon name="pencil" color={Colors.custom.red} type="SimpleLineIcons" size={26} />,
  },
  {
    key: 'tracking',
    content: 'Keep track of your mood, meditation minutes, daily streaks, and journaling habits.',
    icon: <Icon name="line-chart" color={Colors.custom.yellow} type="FontAwesome" size={26} />,
  },
  {
    key: 'game',
    content: 'Enjoy a fish game as a reward for your mindfulness progress!',
    icon: require('@/assets/images/prey.png'),
  },
  {
    key: 'customize',
    content: '',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const { user, refreshProfile } = useSession();
  const { markDone } = useOnboarding();

  const [page, setPage] = useState(0);

  const isFirstPage = page === 0;
  const isLastPage = page === slides.length - 1;

  const onNext = async () => {
    if (!isLastPage) {
      setPage(prev => prev + 1);
      return;
    }

    if (user) {
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
      await markDone();
    } else {
      await markDone();
    }

    router.replace('/');
  };

  const onBack = () => {
    if (!isFirstPage) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <ImageBackground
      source={WAVE}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Logo />
        <View style={styles.content}>
          {slides[page].key === 'customize' ? (
            <FishCustomizer transparent onSaved={onNext} />
          ) : (
            <Slide
              title={isFirstPage ? 'Welcome to Seascape' : undefined}
              body={slides[page].content}
              icon={slides[page].icon}
            />
          )}
        </View>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === page && styles.dotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {!isFirstPage && (
            <Button title="Back" onPress={onBack} color={Colors.custom.lightBlue} />
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
    backgroundColor: Colors.custom.transparent,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 31, 51, 0.7)',
  },
  customizeContainer: {
    backgroundColor: Colors.custom.transparent,
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
    backgroundColor: Colors.custom.transparent
  },
  nextButtonWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: Colors.custom.lightBlue,
  },
});