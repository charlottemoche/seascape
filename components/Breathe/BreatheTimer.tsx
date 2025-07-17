import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { Text, Button } from "@/components/Themed";

type BreatheTimerProps = {
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  sessionComplete: boolean;
  setSessionComplete: (val: boolean) => void;
  onComplete: () => void;
  onSessionEnd: (duration: number) => void;
};

export default function BreatheTimer({
  isRunning,
  setIsRunning,
  sessionComplete,
  setSessionComplete,
  onComplete,
  onSessionEnd,
}: BreatheTimerProps) {
  const [duration, setDuration] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [showTime, setShowTime] = useState(true);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionComplete(true);
      onComplete();
    }
  }, [timeLeft, isRunning]);

  const handleStart = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setShowTime(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setShowTime(true);
  };

  const handleSessionEnd = () => {
    onSessionEnd(duration);
    setSessionComplete(false);
    setIsRunning(false);
    setShowTime(true);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <View>
      {!isRunning && !sessionComplete && (
        <View style={styles.buttonRow}>
          {[1, 3, 5].map((min) => (
            <Pressable
              key={min}
              onPress={() => setDuration(min)}
              style={[
                styles.durationBtn,
                duration === min && {
                  backgroundColor: Colors.custom.blue,
                  opacity: 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === min && {
                    color: Colors.custom.dark,
                    fontWeight: "bold",
                  },
                ]}
              >
                {min} min
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => {
          if (isRunning) {
            setShowTime(!showTime);
          }
        }}
      >
        <View style={styles.timerWrapper}>
          <View style={styles.timerWrapper}>
            <Text
              style={
                sessionComplete || showTime ? styles.timer : styles.noTimer
              }
            >
              {sessionComplete
                ? "00:00"
                : showTime
                ? formatTime(timeLeft)
                : "Tap to reveal time remaining"}
            </Text>
          </View>
        </View>
      </Pressable>

      {!isRunning && !sessionComplete && (
        <Button onPress={handleStart} title="Start" />
      )}
      {isRunning && <Button onPress={handleStop} title="Stop" />}

      {sessionComplete && (
        <Button onPress={handleSessionEnd} title="End Session" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 48,
    color: "white",
    opacity: 0.8,
    marginVertical: 30,
    textAlign: "center",
  },
  noTimer: {
    fontSize: 18,
    color: Colors.custom.lightBlue,
    marginVertical: 30,
    textAlign: "center",
  },
  timerWrapper: {
    height: 120,
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
  },
  startText: {
    fontSize: 18,
    color: Colors.custom.transparent,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  durationBtn: {
    borderColor: Colors.custom.lightBlue,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  durationText: {
    color: Colors.custom.lightBlue,
  },
});
