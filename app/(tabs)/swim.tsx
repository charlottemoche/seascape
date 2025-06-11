import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import fishImages, { FishColor } from '@/constants/fishMap';
import { useSwimGame } from '@/components/hooks/useSwimGame';

export default function SwimScreen() {
  const { hasJournaledToday, hasMeditatedToday, loading } = useUser();
  const canPlayToday = hasJournaledToday && hasMeditatedToday

  const { profile } = useProfile();

  const rawColor = profile?.fish_color ?? 'blue';
  const fishColor = (rawColor in fishImages ? rawColor : 'blue') as FishColor;
  const fishImage = fishImages[fishColor];

  const {
    position,
    gameOver,
    gameStarted,
    playCount,
    swimUp,
    startNewGame,
    resetGame,
  } = useSwimGame(canPlayToday, loading);

  const handlePress = () => {
    if (!canPlayToday || playCount >= 3) return;

    if (!gameStarted || gameOver) {
      startNewGame();
    } else {
      swimUp();
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetGame();
    }, [resetGame])
  );

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <ImageBackground
          source={require('@/assets/images/swim-background.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {!canPlayToday ? (
              <View style={styles.gameMessageOverlay}>
                <Text style={styles.gameSubtext}>
                  You must complete both a journal and a meditation session today to play.
                </Text>
              </View>
            ) : playCount >= 3 && !gameStarted ? (
              <View style={styles.gameMessageOverlay}>
                <Text style={styles.gameStatusText}>You’ve used all 3 plays for today</Text>
                <Text style={styles.gameSubtext}>
                  Come back tomorrow!
                </Text>
              </View>
            ) : gameOver ? (
              <View style={styles.gameMessageOverlay}>
                <Text style={styles.gameStatusText}>Game Over</Text>
                <Text style={styles.gameSubtext}>Tap to restart.</Text>
              </View>
            ) : !gameStarted ? (
              <View style={styles.gameMessageOverlay}>
                <Text style={styles.gameStatusText}>Welcome to Current!</Text>
                <Text style={styles.gameSubtext}>
                  Tap the screen to navigate your fish through the waters and find treats.
                </Text>
              </View>
            ) : null}

            <Animated.Image
              source={fishImage}
              style={[styles.fish, { top: position }]}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 31, 51, 0.5)',
  },
  fish: {
    position: 'absolute',
    left: 50,
    width: 90,
    height: 90,
    zIndex: 10,
  },
  gameMessageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 30,
  },
  gameStatusText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  gameSubtext: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
