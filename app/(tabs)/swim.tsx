import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  ImageBackground,
  Image,
  Alert
} from 'react-native';
import { useProfile } from '@/context/ProfileContext';
import { useRequireAuth } from '@/hooks/user/useRequireAuth';
import { useSwimGame, environments } from '@/hooks/useSwimGame';
import { useCanPlay } from '@/hooks/user/useCanPlayToday';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { supabase } from '@/lib/supabase';
import { resetPlayCount } from '@/lib/playCount';
import { Text } from '@/components/Themed';
import { SwimGameOverlay } from '@/components/SwimGameOverlay';
import { getOverlayMode } from '@/lib/gameOverlay';
import fishImages, { FishColor } from '@/constants/fishMap';
import predatorImg from '@/assets/images/predator.png';
import preyImg from '@/assets/images/prey.png';

export default function SwimScreen() {
  const { user, loading } = useRequireAuth();
  const { profile, refreshProfile } = useProfile();

  const [envMessage, setEnvMessage] = useState<string | null>(null);
  const [invincibleSecondsLeft, setInvincibleSecondsLeft] = useState<number | null>(null);

  const predatorSize = 90;
  const preySize = 50;

  const {
    canPlay,
    loading: canPlayLoading,
    playCount,
    playCountLoaded,
    setPlayCount,
  } = useCanPlay(user?.id);
  const [resetting, setResetting] = useState(false);

  const swimIntervalRef = useRef<number | null>(null);

  // Default color setup for fish
  const rawColor = profile?.fish_color ?? 'blue';
  const fishColor = useMemo(() => {
    return (rawColor in fishImages ? rawColor : 'blue') as FishColor;
  }, [rawColor]);
  const fishImage = useMemo(() => fishImages[fishColor], [fishColor]);
  const tabBarHeight = useBottomTabBarHeight();

  const {
    position,
    gameOver,
    gameStarted,
    setGameStarted,
    setGameOver,
    swimUp,
    startNewGame,
    resetGame,
    obstacles,
    waitingForPlayCountUpdate,
    preyEaten,
    environmentIndex,
    invincible,
  } = useSwimGame({
    userId: user?.id,
    canPlayToday: canPlay,
    loading: loading || canPlayLoading,
    tabBarHeight,
    playCount: playCount ?? 0,
    playCountLoaded: playCountLoaded ?? false,
    onPlayCountChange: setPlayCount,
  });

  const overlayMode = useMemo(() => {
    return getOverlayMode({
      loading,
      canPlay,
      playCount,
      gameStarted,
      gameOver,
      waitingForPlayCountUpdate,
      isReady: !loading && playCountLoaded,
    });
  }, [loading, canPlay, playCount, gameStarted, gameOver, waitingForPlayCountUpdate, playCountLoaded]);

  const handlePressIn = () => {
    if (!canPlay || !gameStarted) return;
    swimUp();
    swimIntervalRef.current = setInterval(swimUp, 120);
  };

  const handlePressOut = () => {
    if (swimIntervalRef.current) {
      clearInterval(swimIntervalRef.current);
      swimIntervalRef.current = null;
    }
  };

  const handleResetPlayCount = async () => {
    if (!user?.id) return;
    setResetting(true);
    try {
      await resetPlayCount(user.id);
      setPlayCount(0);
      resetGame();
      setGameStarted(false);
      setGameOver(false);
    } catch (err) {
      console.error('Reset play count failed:', err);
      Alert.alert('Error', 'Failed to reset play count.');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (!gameStarted || gameOver || environmentIndex === 0) {
      setEnvMessage(null);
      return;
    }

    const envName = environments[environmentIndex].name;
    setEnvMessage(`Entering ${envName}`);

    const timeout = setTimeout(() => {
      setEnvMessage(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [environmentIndex, gameStarted, gameOver]);

  useEffect(() => {
    if (invincible) {
      setInvincibleSecondsLeft(5);
      const interval = setInterval(() => {
        setInvincibleSecondsLeft((sec) => {
          if (sec === 1) {
            clearInterval(interval);
            return null;
          }
          return (sec ?? 1) - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setInvincibleSecondsLeft(null);
    }
  }, [invincible]);

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
        await refreshProfile({ silent: true });
      }
    };

    if (gameOver) {
      maybeUpdateHighScore();
    }
  }, [gameOver, preyEaten, profile, user]);

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <View style={styles.container}>
        <ImageBackground
          source={environments[environmentIndex].backgroundImage}
          style={styles.background}
          resizeMode="cover"
        >

          {envMessage && (
            <View style={styles.envMessageOverlay}>
              <Text style={styles.envMessageText}>{envMessage}</Text>
            </View>
          )}

          {invincible && (
            <View style={styles.invincibleIndicator}>
              <Text style={styles.invincibleText}>
                Invincible{invincibleSecondsLeft !== null ? `: ${invincibleSecondsLeft}s` : '!'}
              </Text>
            </View>
          )}

          <View style={styles.overlay}>

            <SwimGameOverlay
              overlayMode={overlayMode}
              highScore={profile?.high_score ?? 0}
              isAdmin={!!profile?.admin}
              onResetPlayCount={handleResetPlayCount}
              onStartNewGame={startNewGame}
              playsLeft={3 - (playCount ?? 0)}
            />

            {gameStarted && (
              <View style={styles.counter}>
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>Prey:</Text>
                  <Image source={preyImg} style={styles.counterIcon} />
                  <Text style={styles.counterText}>{preyEaten}</Text>
                </View>
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>Plays Left:</Text>
                  <Text style={styles.counterText}>{3 - (playCount ?? 0)}</Text>
                </View>
              </View>
            )}

            <Animated.Image
              source={fishImage}
              style={[styles.fish, { top: position }]}
              resizeMode="contain"
            />

            {obstacles.map(({ id, xValue, y, type }) => {
              const size = type === 'predator' ? predatorSize : preySize;
              const source = type === 'predator' ? predatorImg : preyImg;

              return (
                <View
                  key={id}
                  style={{
                    position: 'absolute',
                    left: xValue,
                    top: y,
                    width: size,
                    height: size,
                  }}
                >
                  <Animated.Image
                    source={source}
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              );
            })}
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
  invincibleIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 30,
    shadowColor: 'gold',
    shadowRadius: 10,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
  },
  invincibleText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  envMessageOverlay: {
    position: 'absolute',
    top: 90,
    right: 0,
    left: 0,
    alignItems: 'center',
    zIndex: 25,
    backgroundColor: 'rgba(0, 31, 51, 0.6)',
    paddingVertical: 6,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  envMessageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});