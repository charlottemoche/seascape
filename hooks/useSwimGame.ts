import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const gravity = 0.6;
const jumpForce = -10;

type Obstacle = {
  id: string;
  x: Animated.Value;
  xValue: number;
  y: number;
  type: 'predator' | 'prey';
  width: number;
};

export function useSwimGame(canPlayToday: boolean, loading: boolean, tabBarHeight: number) {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentSessionStarted, setCurrentSessionStarted] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [preyEaten, setPreyEaten] = useState(0);

  const position = useRef(new Animated.Value(height / 2)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);
  const collidedPreyIds = useRef<Set<string>>(new Set());

  const getTodayKey = () => `playCount:${new Date().toISOString().split('T')[0]}`;

  const resetGame = useCallback(() => {
    positionY.current = height / 5;
    position.setValue(positionY.current);
    velocity.current = 0;
    setGameOver(false);
    setObstacles([]);
    setPreyEaten(0);
    collidedPreyIds.current.clear();
  }, [position]);

  useEffect(() => {
    const loadPlayCount = async () => {
      const key = getTodayKey();
      const count = await AsyncStorage.getItem(key);
      setPlayCount(count ? parseInt(count, 10) : 0);
    };
    loadPlayCount();
  }, []);

  const handlePreyEaten = useCallback((obstacle: Obstacle) => {
    if (collidedPreyIds.current.has(obstacle.id)) return;
    collidedPreyIds.current.add(obstacle.id);

    setObstacles((prev) => prev.filter((ob) => ob.id !== obstacle.id));
    setPreyEaten((count) => count + 1);
    velocity.current = jumpForce * 1.2;
  }, []);

  const handlePredatorCollision = useCallback(() => {
    setGameOver(true);
    setObstacles([]);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let animationFrame: number;

    const tick = () => {
      velocity.current += gravity;
      let newY = positionY.current + velocity.current;

      if (newY < 0) {
        newY = 0;
        velocity.current = 0;
      }

      if (newY > height - tabBarHeight) {
        setGameOver(true);
        setObstacles([]);
        setGameStarted(false);

        if (currentSessionStarted) {
          const key = getTodayKey();
          const newCount = playCount + 1;
          setPlayCount(newCount);
          AsyncStorage.setItem(key, newCount.toString());
          setCurrentSessionStarted(false);
        }
        return;
      }

      positionY.current = newY;
      Animated.timing(position, {
        toValue: newY,
        duration: 0,
        useNativeDriver: false, // or true depending on your case
      }).start();

      // Collision detection
      const fishX = 100;
      const fishY = positionY.current;

      obstacles.forEach((obstacle) => {
        const obstacleX = obstacle.xValue;
        const isXAligned =
          obstacleX + 2 < fishX + 50 && obstacleX + obstacle.width > fishX;
        const isYAligned =
          fishY + 2 < obstacle.y + 50 && fishY + 50 > obstacle.y;

        if (isXAligned && isYAligned) {
          if (obstacle.type === 'predator') {
            handlePredatorCollision();
          } else {
            handlePreyEaten(obstacle);
          }
        }
      });

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    gameStarted,
    gameOver,
    obstacles,
    currentSessionStarted,
    playCount,
    handlePreyEaten,
    handlePredatorCollision,
  ]);

  useEffect(() => {
    if (!gameStarted) return;

    const listeners: { [obstacleId: string]: string } = {};

    const spawnInterval = setInterval(() => {
      const id = Math.random().toString(36).slice(2);
      const type = Math.random() > 0.5 ? 'predator' : 'prey';
      const y = type === 'predator'
        ? Math.random() * (height - 150)
        : 100 + Math.random() * (height / 2 - 150);

      const x = new Animated.Value(width);
      const newObstacle: Obstacle = {
        id,
        x,
        xValue: width,
        y,
        type,
        width: 50,
      };

      const listenerId = x.addListener(({ value }) => {
        setObstacles((prev) =>
          prev.map((ob) =>
            ob.id === id ? { ...ob, xValue: value } : ob
          )
        );
      });
      listeners[id] = listenerId;

      setObstacles((prev) => [...prev, newObstacle]);

      Animated.timing(x, {
        toValue: -100,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        setObstacles((prev) => prev.filter((ob) => ob.id !== id));
        x.removeListener(listenerId);
      });
    }, 1500);

    return () => {
      clearInterval(spawnInterval);
      Object.entries(listeners).forEach(([obstacleId, listenerId]) => {
        const obs = obstacles.find((ob) => ob.id === obstacleId);
        if (obs) obs.x.removeListener(listenerId);
      });
    };
  }, [gameStarted]);

  const startNewGame = useCallback(() => {
    if (loading || !canPlayToday || playCount >= 3) return;
    resetGame();
    setGameOver(false);
    setGameStarted(true);
    setCurrentSessionStarted(true);
    velocity.current = jumpForce;
  }, [loading, canPlayToday, playCount, resetGame]);

  const swimUp = useCallback(() => {
    if (!gameStarted || gameOver) return;
    velocity.current = jumpForce;
  }, [gameStarted, gameOver]);


  // Uncomment this if you want to reset play count for testing purposes
  // useEffect(() => {
  //   const clearPlayCount = async () => {
  //     const todayKey = `playCount:${new Date().toISOString().split('T')[0]}`;
  //     await AsyncStorage.removeItem(todayKey);
  //     console.log('Play count reset for today');
  //     resetGame(); // Reset game position and obstacles
  //     setGameStarted(false); // ensure game is stopped after reset
  //     setGameOver(false);
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
    obstacles,
    preyEaten,
  };
}