import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const gravity = 0.6;
const jumpForce = -10;

export function useSwimGame(canPlayToday: boolean, loading: boolean) {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const position = useRef(new Animated.Value(height / 2)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);

  const getTodayKey = () =>
    `playCount:${new Date().toISOString().split('T')[0]}`;

  const resetGame = useCallback(() => {
    positionY.current = height / 4;
    position.setValue(positionY.current);
    velocity.current = 0;
    setGameOver(false);
  }, [position]);

  useEffect(() => {
    const loadPlayCount = async () => {
      const key = getTodayKey();
      const count = await AsyncStorage.getItem(key);
      setPlayCount(count ? parseInt(count) : 0);
    };

    loadPlayCount();
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const loop = setInterval(() => {
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

    return () => clearInterval(loop);
  }, [gameStarted, gameOver, position]);

  const swimUp = async () => {
    if (loading || !canPlayToday || playCount >= 3) return;

    const key = getTodayKey();
    const newCount = playCount + 1;
    setPlayCount(newCount);
    await AsyncStorage.setItem(key, newCount.toString());

    if (gameOver) {
      resetGame();
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    velocity.current = jumpForce;
  };

  return {
    position,
    gameOver,
    gameStarted,
    playCount,
    swimUp,
    resetGame,
  };
}