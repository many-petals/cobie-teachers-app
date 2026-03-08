import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../data/theme';

interface TimerProps {
  initialMinutes: number;
  onComplete?: () => void;
}

export default function Timer({ initialMinutes, onComplete }: TimerProps) {
  const totalSeconds = initialMinutes * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setSeconds(totalSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const toggle = () => setIsRunning(!isRunning);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  // Calculate progress as a number (0-100), rounded to avoid floating point hydration issues
  const progressPercent = Math.round((1 - seconds / totalSeconds) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercent}%` as any },
          ]}
        />
        <Text style={styles.timeText}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggle} activeOpacity={0.7}>
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={reset}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  timerDisplay: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.secondary + '30',
    borderRadius: RADIUS.md,
  },
  timeText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
});
