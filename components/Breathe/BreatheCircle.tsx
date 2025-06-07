import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

export default function BreatheCircle() {
  const [phase, setPhase] = useState<'Inhale' | 'Exhale'>('Inhale');
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loopBreathing = () => {
      setPhase('Inhale');
      Animated.timing(scale, {
        toValue: 1.6,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setPhase('Exhale');
        Animated.timing(scale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start(loopBreathing);
      });
    };

    loopBreathing();
  }, [scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }],
          },
        ]}
      />
      <Text style={styles.phase}>{phase}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 40,
  },
  phase: {
    fontSize: 28,
    color: '#cfe9f1',
    textAlign: 'center',
    paddingTop: 20,
  },
});
