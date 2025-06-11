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
  const [currentSessionStarted, setCurrentSessionStarted] = useState(false);

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
        setGameStarted(false);

        if (currentSessionStarted) {
          const key = getTodayKey();
          const newCount = playCount + 1;
          setPlayCount(newCount);
          AsyncStorage.setItem(key, newCount.toString());
          setCurrentSessionStarted(false);
        }
      }
    }, 30);

    return () => clearInterval(loop);
  }, [gameStarted, gameOver, position]);

  const startNewGame = () => {
    if (loading || !canPlayToday || playCount >= 3) return;

    resetGame();
    setGameOver(false);
    setGameStarted(true);
    setCurrentSessionStarted(true);
    velocity.current = jumpForce;
  };

  const swimUp = () => {
    if (!gameStarted || gameOver) return;
    velocity.current = jumpForce;
  };

  // UNCOMMENT FOR TESTING
  // useEffect(() => {
  //   const clearPlayCount = async () => {
  //     const todayKey = `playCount:${new Date().toISOString().split('T')[0]}`;
  //     await AsyncStorage.removeItem(todayKey);
  //     console.log('Play count reset for today');
  //   };

  //   clearPlayCount();
  // }, []);

  return {
    position,
    gameOver,
    gameStarted,
    playCount,
    swimUp,
    startNewGame,
    resetGame,
  };
}