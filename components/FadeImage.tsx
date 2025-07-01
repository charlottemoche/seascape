import React, { useRef } from 'react';
import { Animated, View, StyleSheet, ImageProps } from 'react-native';

type Props = ImageProps & {
  placeholderColor?: string;
  durationMs?: number;
  rounded?: boolean;
};

export function FadeImage({
  placeholderColor = 'rgba(204,204,204,0.2)',
  durationMs = 250,
  rounded = true,
  style,
  ...img
}: Props) {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const placeholderOpacity = useRef(new Animated.Value(1)).current;

  const handleLoad = () => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: durationMs,
        useNativeDriver: true,
      }),
      Animated.timing(placeholderOpacity, {
        toValue: 0,
        duration: durationMs,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[style, rounded && { borderRadius: 8 }]}>
      {/* placeholder box */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: placeholderColor, opacity: placeholderOpacity },
          rounded && { borderRadius: 8 },
        ]}
      />
      {/* real image */}
      <Animated.Image
        {...img}
        onLoad={handleLoad}
        style={[
          StyleSheet.absoluteFill,
          style,
          { opacity: imageOpacity },
          rounded && { borderRadius: 8 },
        ]}
      />
    </View>
  );
}