import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import { incrementPlayCount } from '@/lib/playCount';
import { useAudioPlayer } from 'expo-audio';

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

type UseSwimGameParams = {
  userId?: string;
  canPlayToday: boolean;
  loading: boolean;
  tabBarHeight: number;
  playCount: number;
  playCountLoaded: boolean;
  onPlayCountChange?: (newCount: number) => void;
};

export function useSwimGame({
  userId,
  canPlayToday,
  loading,
  tabBarHeight,
  playCount,
  playCountLoaded,
  onPlayCountChange,
}: UseSwimGameParams) {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSessionStarted, setCurrentSessionStarted] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [preyEaten, setPreyEaten] = useState(0);

  const position = useRef(new Animated.Value(height / 2)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);
  const collidedPreyIds = useRef<Set<string>>(new Set());

  const player = useAudioPlayer(require('@/assets/sounds/chomp.wav'));

  const resetGame = useCallback(() => {
    positionY.current = height / 5;
    position.setValue(positionY.current);
    velocity.current = 0;
    setGameOver(false);
    setObstacles([]);
    setPreyEaten(0);
    collidedPreyIds.current.clear();
  }, [position]);

  const endGame = useCallback(() => {
    setGameOver(true);
    setObstacles([]);
    setGameStarted(false);

    if (player.playing) {
      player.pause();
      player.seekTo(0);
    } else {
      player.seekTo(0);
    }

    player.replace(require('@/assets/sounds/pop.wav'));
    player.play();

    if (currentSessionStarted && userId && onPlayCountChange) {
      incrementPlayCount(userId).then((newCount) => {
        onPlayCountChange(newCount);
      });
    }
  }, [currentSessionStarted, userId, onPlayCountChange]);

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
        endGame();
        return;
      }

      positionY.current = newY;
      Animated.timing(position, {
        toValue: newY,
        duration: 0,
        useNativeDriver: false,
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
            endGame();
          } else {
            if (!collidedPreyIds.current.has(obstacle.id)) {
              collidedPreyIds.current.add(obstacle.id);
              setObstacles((prev) => prev.filter((ob) => ob.id !== obstacle.id));
              setPreyEaten((count) => count + 1);

              if (player.playing) {
                player.pause();
                player.seekTo(0);
              } else {
                player.seekTo(0);
              }

              player.replace(require('@/assets/sounds/chomp.wav'));
              player.play();

              velocity.current = jumpForce * 1.2;
            }
          }
        }
      });

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameStarted, gameOver, obstacles, tabBarHeight, endGame]);

  useEffect(() => {
    if (!gameStarted) return;

    const listeners: { [obstacleId: string]: string } = {};

    const spawnInterval = setInterval(() => {
      const spawnCount = 2;

      for (let i = 0; i < spawnCount; i++) {
        const id = Math.random().toString(36).slice(2);
        const type = Math.random() > 0.5 ? 'predator' : 'prey';

        const baseY =
          type === 'predator'
            ? Math.random() * (height - 150)
            : 100 + Math.random() * (height / 2 - 150);
        const y = baseY + i * 60;

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
            prev.map((ob) => (ob.id === id ? { ...ob, xValue: value } : ob))
          );
        });
        listeners[id] = listenerId;

        setObstacles((prev) => [...prev, newObstacle]);

        Animated.timing(x, {
          toValue: -100,
          duration: 3000,
          delay: i * 300 + Math.random() * 300,
          useNativeDriver: false,
        }).start(() => {
          setObstacles((prev) => prev.filter((ob) => ob.id !== id));
          x.removeListener(listenerId);
        });
      }
    }, 400);

    return () => {
      clearInterval(spawnInterval);
      Object.entries(listeners).forEach(([obstacleId, listenerId]) => {
        const obs = obstacles.find((ob) => ob.id === obstacleId);
        if (obs) obs.x.removeListener(listenerId);
      });
    };
  }, [gameStarted, obstacles]);

  const startNewGame = useCallback(() => {
    if (loading || !canPlayToday || playCountLoaded === false || playCount >= 3)
      return;
    resetGame();
    setGameOver(false);
    setGameStarted(true);
    setCurrentSessionStarted(true);
    velocity.current = jumpForce;
  }, [loading, canPlayToday, playCount, playCountLoaded, resetGame]);

  const swimUp = useCallback(() => {
    if (!gameStarted || gameOver) return;
    velocity.current = jumpForce;
  }, [gameStarted, gameOver]);

  return {
    position,
    gameOver,
    gameStarted,
    playCount,
    playCountLoaded,
    swimUp,
    startNewGame,
    resetGame,
    obstacles,
    preyEaten,
  };
}