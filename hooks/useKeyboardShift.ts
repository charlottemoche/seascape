import { useEffect, useRef } from 'react';
import { Keyboard, Animated } from 'react-native';

export function useKeyboardShift(shiftAmount = 60, showDuration = 300, hideDuration = 300) {
  const shiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(shiftAnim, {
        toValue: -shiftAmount,
        duration: showDuration,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(shiftAnim, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [shiftAnim, shiftAmount, showDuration, hideDuration]);

  return shiftAnim;
}