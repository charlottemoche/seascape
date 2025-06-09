import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase';
import fishImages, { FishColor } from '@/constants/fishMap';

const { height } = Dimensions.get('window');

export default function SwimScreen() {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const { user, hasJournaledToday, hasMeditatedToday, loading } = useUser();
  const canPlayToday = hasJournaledToday && hasMeditatedToday;

  const { profile } = useUser();

  const rawColor = profile?.fish_color ?? 'blue';
  const fishColor = (rawColor in fishImages ? rawColor : 'blue') as FishColor;
  const fishImage = fishImages[fishColor];

  const position = useRef(new Animated.Value(height / 2)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);
  const gravity = 0.6;
  const jumpForce = -10;

  useFocusEffect(
    useCallback(() => {
      positionY.current = height / 4;
      position.setValue(positionY.current);
      velocity.current = 0;
      setGameOver(false);
    }, [position])
  );

  useEffect(() => {
    const checkPlayCount = async () => {
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('plays')
        .select('count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (data?.count !== undefined) {
        setPlayCount(data.count);
      }
    };

    checkPlayCount();
  }, [user]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      if (gameOver) return;

      velocity.current += gravity;
      let newY = positionY.current + velocity.current;

      if (newY < 0) {
        newY = 0;
        velocity.current = 0;
      }

      positionY.current = newY;
      position.setValue(newY);

      if (newY > height) {
        setGameOver(true);
      }
    }, 30);

    return () => clearInterval(gameLoop);
  }, [position, gameOver, gameStarted]);

  const swimUp = async () => {
    if (loading || !user || !canPlayToday || playCount >= 3) return;

    const today = new Date().toISOString().split('T')[0];
    const newCount = playCount + 1;
    setPlayCount(newCount);

    const { data: existingPlay } = await supabase
      .from('plays')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existingPlay) {
      await supabase
        .from('plays')
        .update({ count: newCount })
        .eq('id', existingPlay.id);
    } else {
      await supabase
        .from('plays')
        .insert([{ user_id: user.id, date: today, count: 1 }]);
    }

    if (gameOver) {
      setGameOver(false);
      positionY.current = height / 3;
      position.setValue(positionY.current);
      velocity.current = 0;
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    velocity.current = jumpForce;
  };

  return (
    <TouchableWithoutFeedback onPress={swimUp}>
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
            ) : playCount >= 3 ? (
              <View style={styles.gameMessageOverlay}>
                <Text style={styles.gameSubtext}>
                  You’ve used all 3 plays for today. Come back tomorrow!
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
    fontSize: 32,
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
