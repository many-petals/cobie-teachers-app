import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { EMOTIONS } from '../data/emotions';

export interface EmotionLogEntry {
  id: string;
  emotion_id: string;
  emotion_name: string;
  context: string;
  notes: string;
  logged_at: string;
}

const CONTEXT_LABELS: Record<string, string> = {
  morning: 'Morning arrival',
  circle: 'Circle time',
  lesson: 'During lesson',
  playtime: 'Playtime',
  lunchtime: 'Lunchtime',
  transition: 'Transition',
  afternoon: 'Afternoon',
  'end-of-day': 'End of day',
  other: 'Other',
};

interface Props {
  logs: EmotionLogEntry[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export default function EmotionHistory({ logs, onDelete, showDelete = false, maxItems, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (logs.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="heart-outline" size={32} color={COLORS.mediumGray} />
        <Text style={styles.emptyText}>No emotion logs yet</Text>
        <Text style={styles.emptySubText}>
          Tap "Log Emotion" to record how this pupil is feeling
        </Text>
      </View>
    );
  }

  // Calculate emotion frequency
  const emotionCounts: Record<string, number> = {};
  logs.forEach(l => {
    emotionCounts[l.emotion_id] = (emotionCounts[l.emotion_id] || 0) + 1;
  });

  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1]);

  const totalLogs = logs.length;

  // Group by day
  const groupByDay = (entries: EmotionLogEntry[]) => {
    const groups: Record<string, EmotionLogEntry[]> = {};
    entries.forEach(entry => {
      const date = new Date(entry.logged_at).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const displayLogs = maxItems && !expanded ? logs.slice(0, maxItems) : logs;
  const dayGroups = groupByDay(displayLogs);

  // Most common emotion
  const topEmotionId = sortedEmotions[0]?.[0];
  const topEmotion = EMOTIONS.find(e => e.id === topEmotionId);

  // Recent trend (last 5 vs previous 5)
  const getTrend = () => {
    if (logs.length < 4) return null;
    const positiveEmotions = ['happy', 'calm', 'excited'];
    const recent = logs.slice(0, Math.min(5, Math.floor(logs.length / 2)));
    const older = logs.slice(Math.min(5, Math.floor(logs.length / 2)), Math.min(10, logs.length));
    
    const recentPositive = recent.filter(l => positiveEmotions.includes(l.emotion_id)).length / recent.length;
    const olderPositive = older.filter(l => positiveEmotions.includes(l.emotion_id)).length / older.length;
    
    if (recentPositive > olderPositive + 0.15) return 'improving';
    if (recentPositive < olderPositive - 0.15) return 'declining';
    return 'stable';
  };

  const trend = getTrend();

  return (
    <View style={styles.container}>
      {/* Emotion Frequency Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="pulse" size={18} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Emotion Overview</Text>
          <Text style={styles.summaryCount}>{totalLogs} log{totalLogs !== 1 ? 's' : ''}</Text>
        </View>

        {/* Frequency bars */}
        <View style={styles.freqBars}>
          {sortedEmotions.slice(0, 5).map(([emotionId, count]) => {
            const em = EMOTIONS.find(e => e.id === emotionId);
            if (!em) return null;
            const pct = Math.round((count / totalLogs) * 100);
            return (
              <View key={emotionId} style={styles.freqRow}>
                <View style={styles.freqLabel}>
                  <Ionicons name={em.icon as any} size={16} color={em.color} />
                  <Text style={[styles.freqName, { color: em.color }]}>{em.name}</Text>
                </View>
                <View style={styles.freqBarBg}>
                  <View style={[styles.freqBarFill, { width: `${pct}%`, backgroundColor: em.color }]} />
                </View>
                <Text style={styles.freqPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        {/* Insights row */}
        <View style={styles.insightsRow}>
          {topEmotion && (
            <View style={[styles.insightChip, { backgroundColor: topEmotion.bgColor }]}>
              <Ionicons name={topEmotion.icon as any} size={14} color={topEmotion.color} />
              <Text style={[styles.insightText, { color: topEmotion.color }]}>
                Most common: {topEmotion.name}
              </Text>
            </View>
          )}
          {trend && (
            <View style={[styles.insightChip, {
              backgroundColor: trend === 'improving' ? COLORS.bgGreen
                : trend === 'declining' ? '#FFEBEE' : COLORS.bgLight,
            }]}>
              <Ionicons
                name={trend === 'improving' ? 'trending-up' : trend === 'declining' ? 'trending-down' : 'remove'}
                size={14}
                color={trend === 'improving' ? COLORS.success : trend === 'declining' ? COLORS.error : COLORS.textMuted}
              />
              <Text style={[styles.insightText, {
                color: trend === 'improving' ? COLORS.success : trend === 'declining' ? COLORS.error : COLORS.textMuted,
              }]}>
                Trend: {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Needs attention' : 'Stable'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Timeline */}
      {!compact && (
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Emotion Timeline</Text>
          {Object.entries(dayGroups).map(([date, entries]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayLabel}>{date}</Text>
              {entries.map(entry => {
                const em = EMOTIONS.find(e => e.id === entry.emotion_id);
                if (!em) return null;
                const time = new Date(entry.logged_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View key={entry.id} style={styles.logEntry}>
                    <View style={[styles.logDot, { backgroundColor: em.color }]} />
                    <View style={styles.logContent}>
                      <View style={styles.logTopRow}>
                        <Ionicons name={em.icon as any} size={16} color={em.color} />
                        <Text style={[styles.logEmotion, { color: em.color }]}>{em.name}</Text>
                        <Text style={styles.logTime}>{time}</Text>
                        {showDelete && onDelete && (
                          <TouchableOpacity
                            onPress={() => onDelete(entry.id)}
                            style={styles.logDeleteBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                      {entry.context ? (
                        <Text style={styles.logContext}>
                          {CONTEXT_LABELS[entry.context] || entry.context}
                        </Text>
                      ) : null}
                      {entry.notes ? (
                        <Text style={styles.logNotes}>{entry.notes}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {maxItems && logs.length > maxItems && !expanded && (
            <TouchableOpacity
              style={styles.showMoreBtn}
              onPress={() => setExpanded(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>
                Show all {logs.length} entries
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  // Summary card
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryCount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  // Frequency bars
  freqBars: {
    gap: SPACING.sm,
  },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  freqLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 100,
  },
  freqName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  freqBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  freqBarFill: {
    height: '100%',
    borderRadius: 5,
    minWidth: 4,
  },
  freqPct: {
    width: 32,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  // Insights
  insightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  insightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  insightText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  // Timeline
  timelineSection: {
    marginTop: SPACING.sm,
  },
  timelineTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dayGroup: {
    marginBottom: SPACING.md,
  },
  dayLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  logEntry: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  logContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logEmotion: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  logTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  logDeleteBtn: {
    padding: 4,
  },
  logContext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: 4,
  },
  logNotes: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  // Show more
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  showMoreText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  emptySubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
