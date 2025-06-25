import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { bumpPlayCount } from './useLightSync';
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

type UseSwimGameParams = {
  userId?: string;
  canPlayToday: boolean;
  loading: boolean;
  tabBarHeight: number;
  playCount: number;
  onPlayCountChange?: (newCount: number) => void;
};

type Environment = {
  name: string;
  backgroundImage: any;
  spawnInterval: number;
  obstacleSpeed: number;
  maxObstacles: number;
  preyRatio: number;
};

export const environments: Environment[] = [
  {
    name: 'Deep Sea',
    backgroundImage: require('@/assets/images/swim-background.png'),
    spawnInterval: 100,
    obstacleSpeed: 3500,
    maxObstacles: 2,
    preyRatio: 0.7,
  },
  {
    name: 'Kelp Forest',
    backgroundImage: require('@/assets/images/kelp-forest.png'),
    spawnInterval: 150,
    obstacleSpeed: 3000,
    maxObstacles: 3,
    preyRatio: 0.6,
  },
  {
    name: 'Coral Reef',
    backgroundImage: require('@/assets/images/coral-reef.png'),
    spawnInterval: 130,
    obstacleSpeed: 2500,
    maxObstacles: 4,
    preyRatio: 0.5,
  },
];

export function useSwimGame({
  userId,
  canPlayToday,
  loading,
  tabBarHeight,
  playCount,
  onPlayCountChange,
}: UseSwimGameParams) {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSessionStarted, setCurrentSessionStarted] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [preyEaten, setPreyEaten] = useState(0);
  const [environmentIndex, setEnvironmentIndex] = useState(0);
  const [invincible, setInvincible] = useState(false);
  const [waitingForPlayCountUpdate, setWaitingForPlayCountUpdate] = useState(false);

  const position = useRef(new Animated.Value(height / 7)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);
  const collidedPreyIds = useRef<Set<string>>(new Set());
  const obstaclesRef = useRef<Obstacle[]>([]);
  const upgradeThresholds = [10, 30];

  const player = useAudioPlayer(require('@/assets/sounds/chomp.wav'));

  const resetGame = useCallback(() => {
    positionY.current = height / 5;
    position.setValue(positionY.current);
    velocity.current = 0;
    setGameOver(false);
    setObstacles([]);
    setPreyEaten(0);
    collidedPreyIds.current.clear();
    setEnvironmentIndex(0);
    setInvincible(false);
  }, [position]);

  const endGame = useCallback(() => {
    if (player.playing) {
      player.pause();
      player.seekTo(0);
    } else {
      player.seekTo(0);
    }

    player.replace(require('@/assets/sounds/pop.wav'));
    player.play();
    setGameOver(true);
    setWaitingForPlayCountUpdate(true);
    setObstacles([]);
    setGameStarted(false);
    setInvincible(false);
    setEnvironmentIndex(0);

    if (currentSessionStarted && onPlayCountChange) {
      onPlayCountChange?.(playCount + 1);
      setWaitingForPlayCountUpdate(false);
    } else {
      setWaitingForPlayCountUpdate(false);
    }
  }, [currentSessionStarted, onPlayCountChange, playCount]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  useEffect(() => {
    if (environmentIndex >= upgradeThresholds.length) return;

    if (preyEaten >= upgradeThresholds[environmentIndex]) {
      setEnvironmentIndex(environmentIndex + 1);
    }
  }, [preyEaten, environmentIndex]);

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
            if (!invincible) {
              endGame();
            }
          } else {
            if (!collidedPreyIds.current.has(obstacle.id)) {
              if (player.playing) {
                player.pause();
                player.seekTo(0);
              } else {
                player.seekTo(0);
              }

              player.replace(require('@/assets/sounds/chomp.wav'));
              player.play();

              collidedPreyIds.current.add(obstacle.id);
              setObstacles((prev) => prev.filter((ob) => ob.id !== obstacle.id));
              setPreyEaten((count) => count + 1);

              if ((preyEaten + 1) % 10 === 5) {
                setInvincible(true);
                setTimeout(() => setInvincible(false), 5000);
              }

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

    const env = environments[environmentIndex];
    let isCancelled = false;

    const spawnObstacle = () => {
      if (isCancelled) return;

      if (obstaclesRef.current.length >= env.maxObstacles) {
        // Skip spawn if too many obstacles
      } else {
        const isPrey = Math.random() < env.preyRatio;
        const type = isPrey ? 'prey' : 'predator';
        const id = Math.random().toString(36).slice(2);

        const baseY =
          type === 'predator'
            ? Math.random() * (height - 150)
            : 100 + Math.random() * (height / 2 - 150);
        const y = baseY;

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

        setObstacles((prev) => [...prev, newObstacle]);

        Animated.timing(x, {
          toValue: -100,
          duration: env.obstacleSpeed,
          delay: Math.random() * 300,
          useNativeDriver: false,
        }).start(() => {
          setObstacles((prev) => prev.filter((ob) => ob.id !== id));
          x.removeListener(listenerId);
        });
      }

      const nextDelay = env.spawnInterval + Math.random() * 500;
      setTimeout(spawnObstacle, nextDelay);
    };

    spawnObstacle();

    return () => {
      isCancelled = true;
    };
  }, [gameStarted, environmentIndex]);

  const startNewGame = useCallback(() => {
    if (loading || !canPlayToday || playCount >= 3)
      return;
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

  return {
    position,
    gameOver,
    gameStarted,
    setGameStarted,
    setGameOver,
    playCount,
    waitingForPlayCountUpdate,
    swimUp,
    startNewGame,
    resetGame,
    obstacles,
    preyEaten,
    environmentIndex,
    invincible,
  };
}