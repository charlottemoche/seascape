import { useEffect, useRef } from 'react';
import { Keyboard, Animated, Platform } from 'react-native';

export function useKeyboardShift(shiftAmount = 60, showDuration = 300, hideDuration = 300) {
  const shiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      Animated.timing(shiftAnim, {
        toValue: -shiftAmount,
        duration: showDuration,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
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