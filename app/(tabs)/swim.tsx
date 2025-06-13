import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/context/ProfileContext';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import fishImages, { FishColor } from '@/constants/fishMap';
import { useSwimGame } from '@/hooks/useSwimGame';
import predatorImg from '@/assets/images/predator.png';
import preyImg from '@/assets/images/prey.png';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { supabase } from '@/lib/supabase';

export default function SwimScreen() {
  const { user, loading } = useRequireAuth();
  const { profile, refreshProfile } = useProfile();

  // Default color setup for fish
  const rawColor = profile?.fish_color ?? 'blue';
  const fishColor = React.useMemo(() => {
    return (rawColor in fishImages ? rawColor : 'blue') as FishColor;
  }, [rawColor]);
  const fishImage = fishImages[fishColor];
  const tabBarHeight = useBottomTabBarHeight();

  // Define canPlayToday based on journal and meditation status
  const canPlayToday = (profile?.journal_streak ?? 0) > 0 && (profile?.breath_streak ?? 0) > 0;
  // Uncomment this if you want to play for testing
  // const canPlayToday = true;

  const {
    position,
    gameOver,
    gameStarted,
    playCount,
    swimUp,
    startNewGame,
    resetGame,
    obstacles,
    preyEaten,
  } = useSwimGame(canPlayToday, loading, tabBarHeight);
  // Set canPlayToday to true for testing

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

  useEffect(() => {
    const maybeUpdateHighScore = async () => {
      if (!user?.id || preyEaten <= (profile?.high_score ?? 0)) return;

      const { error } = await supabase
        .from('profiles')
        .update({ high_score: preyEaten })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update high score:', error);
      } else {
        await refreshProfile();
      }
    };

    if (gameOver) {
      maybeUpdateHighScore();
    }
  }, [gameOver, preyEaten, profile, user]);

  const renderOverlay = () => {
    if (!canPlayToday) {
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameSubtext}>
            You must complete both a journal and a meditation session today to play.
          </Text>
        </View>
      );
    }

    if (playCount >= 3 && !gameStarted) {
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>You’ve used all 3 plays for today</Text>
          <Text style={styles.gameSubtext}>Come back tomorrow!</Text>
          <View style={styles.highScoreRow}>
            <Text style={styles.gameSubtext}>High score: {profile?.high_score ?? 0}</Text>
            <Image
              source={preyImg}
              style={styles.preyIcon}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    }

    if (gameOver) {
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>Game Over</Text>
          <Text style={styles.gameSubtext}>Tap to restart.</Text>
          <View style={styles.highScoreRow}>
            <Text style={styles.gameSubtext}>High Score: {profile?.high_score ?? 0}</Text>
            <Image
              source={preyImg}
              style={styles.preyIcon}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    }

    if (!gameStarted) {
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>Welcome to Current!</Text>
          <Text style={styles.gameSubtext}>
            Tap the screen to navigate your fish through the waters and find treats.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <ImageBackground
          source={require('@/assets/images/swim-background.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>

            {renderOverlay()}

            {gameStarted && (
              <View style={styles.counter}>
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>Prey:</Text>
                  <Image source={preyImg} style={styles.counterIcon} />
                  <Text style={styles.counterText}>{preyEaten}</Text>
                </View>
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>Plays Left:</Text>
                  <Text style={styles.counterText}>{3 - playCount}</Text>
                </View>
              </View>
            )}

            <Animated.Image
              source={fishImage}
              style={[styles.fish, { top: position }]}
              resizeMode="contain"
            />

            {obstacles.map(({ id, xValue, y, type }) => (
              <View
                key={id}
                style={{
                  position: 'absolute',
                  left: xValue,
                  top: y,
                  width: type === 'predator' ? 90 : 50,
                  height: type === 'predator' ? 90 : 50,
                }}
              >
                <Animated.Image
                  source={type === 'predator' ? predatorImg : preyImg}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              </View>
            ))}
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
  counter: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 31, 51, 0.6)',
    padding: 10,
    borderRadius: 8,
    zIndex: 20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  counterLabel: {
    color: 'white',
    fontSize: 14,
    marginRight: 6,
  },
  counterIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  counterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  preyIcon: {
    width: 24,
    height: 24,
    marginLeft: 6,
  },
});