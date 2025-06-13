import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

type BreatheTimerProps = {
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  onComplete: (duration: number) => void | Promise<void>;
};

export default function BreatheTimer({
  isRunning,
  setIsRunning,
  onComplete,
}: BreatheTimerProps) {
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
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
          // Cannot call setIsRunning or onComplete here directly
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Separate effect to handle side-effects after timeLeft changes
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onComplete(duration);
    }
  }, [timeLeft, isRunning, onComplete, duration]);

  const handleStart = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setShowTime(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setShowTime(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View>
      {!isRunning && (
        <View style={styles.buttonRow}>
          {[1, 5, 10].map((min) => (
            <Pressable
              key={min}
              onPress={() => setDuration(min)}
              style={[
                styles.durationBtn,
                duration === min && { backgroundColor: Colors.custom.lightBlue },
                { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === min && { color: Colors.custom.background, fontWeight: 'bold' },
                ]}
              >
                {min} min
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable onPress={() => setShowTime(!showTime)}>
        <View style={styles.timerWrapper}>
          <Text style={showTime ? styles.timer : styles.noTimer}>
            {showTime ? formatTime(timeLeft) : 'Tap to reveal time remaining'}
          </Text>
        </View>
      </Pressable>

      {!isRunning ? (
        <Pressable onPress={handleStart} style={styles.startBtn}>
          <Text style={styles.startText}>Start</Text>
        </Pressable>
      ) : (
        <Pressable onPress={handleStop} style={styles.startBtn}>
          <Text style={styles.startText}>Stop</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 48,
    color: 'white',
    opacity: 0.8,
    marginVertical: 30,
    textAlign: 'center',
  },
  noTimer: {
    fontSize: 18,
    color: Colors.custom.lightBlue,
    marginVertical: 30,
    textAlign: 'center',
  },
  timerWrapper: {
    height: 120,
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: Colors.custom.lightBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  startText: {
    fontSize: 18,
    color: Colors.custom.background,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  durationBtn: {
    borderColor: Colors.custom.lightBlue,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  durationText: {
    color: Colors.custom.lightBlue,
  },
  phase: {
    fontSize: 20,
    color: Colors.custom.lightBlue,
    textAlign: 'center',
    marginTop: 20,
  },
});
