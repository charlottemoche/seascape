import { useEffect, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { Text } from "@/components/Themed";

export default function BreatheCircle({
  sessionComplete,
}: {
  sessionComplete: boolean;
}) {
  const [phase, setPhase] = useState<"Inhale" | "Exhale">("Inhale");
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    breathingAnimation.start();

    // Cleanup
    return () => {
      breathingAnimation.stop();
    };
  }, [scale]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev === "Inhale" ? "Exhale" : "Inhale"));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          !sessionComplete && {
            transform: [{ scale }],
          },
        ]}
      />
      <Text style={styles.phase}>{sessionComplete ? "Completed" : phase}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 40,
  },
  phase: {
    fontSize: 28,
    color: Colors.custom.lightBlue,
    textAlign: "center",
    paddingTop: 40,
  },
});
