import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type BreatheTimerProps = {
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  onComplete: () => void;
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
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

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
          {[5, 10].map((min) => (
            <Pressable
              key={min}
              onPress={() => setDuration(min)}
              style={[
                styles.durationBtn,
                duration === min && { backgroundColor: '#cfe9f1' },
                { opacity: 0.5 },
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === min && { color: '#001f33', fontWeight: 'bold' },
                ]}
              >
                {min} min
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable onPress={() => setShowTime(!showTime)}>
        <Text style={showTime ? styles.timer : styles.noTimer}>
          {showTime ? formatTime(timeLeft) : 'Tap to reveal time remaining'}
        </Text>
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
    color: '#cfe9f1',
    marginVertical: 30,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#cfe9f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  startText: {
    fontSize: 18,
    color: '#001f33',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  durationBtn: {
    borderColor: '#cfe9f1',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  durationText: {
    color: '#cfe9f1',
  },
  phase: {
    fontSize: 20,
    color: '#cfe9f1',
    textAlign: 'center',
    marginTop: 20,
  },
});
