import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { ACTIVITIES } from '../data/activities';

// Deterministic index based on date - same on server and client for the same day
function getDeterministicIndex(): number {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % ACTIVITIES.length;
}

export default function TodayActivity({ onViewActivity }: { onViewActivity: (id: string) => void }) {
  // Use a deterministic initial value to avoid hydration mismatch
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set the actual index only on client side after mount
    setCurrentIndex(getDeterministicIndex());
    setMounted(true);
  }, []);

  const activity = ACTIVITIES[currentIndex];

  const generateNew = () => {
    let newIndex = currentIndex;
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * ACTIVITIES.length);
    }
    setCurrentIndex(newIndex);
  };

  if (!activity) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={20} color={COLORS.accent} />
          <Text style={styles.headerTitle}>Today's Activity</Text>
        </View>
        <TouchableOpacity onPress={generateNew} style={styles.refreshButton} activeOpacity={0.7}>
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
          <Text style={styles.refreshText}>New</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: activity.color }]}
        onPress={() => onViewActivity(activity.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBg, { backgroundColor: activity.color + '20' }]}>
          <Ionicons name={activity.icon as any} size={28} color={activity.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityType}>{activity.type}</Text>
          <Text style={styles.activityDuration}>{activity.duration}</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color={activity.color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
  },
  refreshText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  activityDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
