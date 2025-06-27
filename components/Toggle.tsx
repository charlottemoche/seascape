import React, { useCallback, useRef, useEffect } from 'react';
import { Pressable, Animated, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function Toggle({
  value,
  onChange,
  size = 28,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  size?: number;
}) {

  const colorScheme = useColorScheme();
  const knob = useRef(new Animated.Value(value ? 1 : 0)).current;

  const trackOn = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.blue;
  const trackOff = colorScheme === 'dark' ? '#444' : '#ccc';
  const knobColor = colorScheme === 'dark' ? '#fafafa' : '#fff';

  useEffect(() => {
    Animated.timing(knob, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggle = useCallback(() => onChange(!value), [value, onChange]);

  const trackWidth = size * 1.8;
  const knobSize = size * 0.9;
  const knobLeft = knob.interpolate({
    inputRange: [0, 1],
    outputRange: [2, trackWidth - knobSize - 2],
  });

  return (
    <Pressable onPress={toggle} style={{ width: trackWidth }}>
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: size,
            borderRadius: size / 2,
            backgroundColor: value ? trackOn : trackOff,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              backgroundColor: knobColor,
              transform: [{ translateX: knobLeft }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    padding: 2,
  },
  knob: {
    position: 'absolute',
    top: 2,
    elevation: 2,
  },
});