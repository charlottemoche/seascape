import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Text, View, TouchableWithoutFeedback, Animated, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function SwimScreen() {
  const [isGameOver, setIsGameOver] = useState(false);
  const position = useRef(new Animated.Value(height / 2)).current;
  const positionY = useRef(height / 2);
  const velocity = useRef(0);
  const gravity = 0.6;
  const jumpForce = -10;

  useFocusEffect(
    useCallback(() => {
      positionY.current = height / 2;
      position.setValue(positionY.current);
      velocity.current = 0;
      setIsGameOver(false);
    }, [position])
  );

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (isGameOver) return;

      velocity.current += gravity;
      const newY = positionY.current + velocity.current;

      // update internal state
      positionY.current = newY;
      position.setValue(newY);

      // game over if fish falls too far
      if (newY > height) {
        setIsGameOver(true);
      }
    }, 30);

    return () => clearInterval(gameLoop);
  }, [position, isGameOver]);

  const swimUp = () => {
    velocity.current = jumpForce;
  };

  return (
    <TouchableWithoutFeedback onPress={swimUp}>
      <View style={styles.container}>
        <ImageBackground
          source={require('@/assets/images/wave.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {isGameOver && (
              <View style={styles.gameOverOverlay}>
                <Text style={styles.gameOverText}>Game Over</Text>
              </View>
            )}
            <Animated.Image
              source={require('@/assets/images/fish.png')}
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
    backgroundColor: 'rgba(0, 31, 51, 0.6)',
  },
  fish: {
    position: 'absolute',
    left: 50,
    width: 60,
    height: 60,
    zIndex: 10,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
