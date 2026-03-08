import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { CALMING_ACTIVITIES, GROUNDING_PROMPTS, REGULATION_TOOLS } from '../data/emotions';

const EMOTION_OPTIONS = [
  { label: 'Overwhelmed', value: 'overwhelmed', icon: 'thunderstorm-outline', color: '#78909C' },
  { label: 'Angry', value: 'angry', icon: 'flame-outline', color: '#EF5350' },
  { label: 'Sad', value: 'sad', icon: 'sad-outline', color: '#64B5F6' },
  { label: 'Worried', value: 'worried', icon: 'alert-circle-outline', color: '#FFB74D' },
  { label: 'Excited', value: 'excited', icon: 'star-outline', color: '#FF7043' },
];

const NOISE_OPTIONS = [
  { label: 'Very Quiet', value: 'quiet', icon: 'volume-mute-outline' },
  { label: 'Some Noise', value: 'medium', icon: 'volume-low-outline' },
  { label: 'Noisy', value: 'noisy', icon: 'volume-high-outline' },
];

const TIME_OPTIONS = [
  { label: '2 min', value: 2 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
];

export default function CalmCornerBuilderComponent() {
  const [emotion, setEmotion] = useState('');
  const [noise, setNoise] = useState('');
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<{
    activity: typeof CALMING_ACTIVITIES[0];
    prompt: string;
    tool: typeof REGULATION_TOOLS[0];
  } | null>(null);

  const generateSuggestion = () => {
    if (!emotion || !noise || !time) return;

    // Pick based on selections
    const activityIndex = (emotion.length + time) % CALMING_ACTIVITIES.length;
    const promptIndex = (emotion.length + noise.length) % GROUNDING_PROMPTS.length;
    const toolIndex = (noise.length + time) % REGULATION_TOOLS.length;

    setResult({
      activity: CALMING_ACTIVITIES[activityIndex],
      prompt: GROUNDING_PROMPTS[promptIndex],
      tool: REGULATION_TOOLS[toolIndex],
    });
  };

  const isReady = emotion && noise && time > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Emotion Selection */}
      <Text style={styles.sectionTitle}>How is the child feeling?</Text>
      <View style={styles.optionsRow}>
        {EMOTION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.emotionChip,
              emotion === opt.value && { backgroundColor: opt.color + '20', borderColor: opt.color },
            ]}
            onPress={() => setEmotion(opt.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={opt.icon as any}
              size={20}
              color={emotion === opt.value ? opt.color : COLORS.textLight}
            />
            <Text
              style={[
                styles.chipLabel,
                emotion === opt.value && { color: opt.color, fontWeight: '700' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Noise Level */}
      <Text style={styles.sectionTitle}>Current noise level?</Text>
      <View style={styles.noiseRow}>
        {NOISE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.noiseChip,
              noise === opt.value && styles.noiseChipActive,
            ]}
            onPress={() => setNoise(opt.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={opt.icon as any}
              size={22}
              color={noise === opt.value ? COLORS.white : COLORS.textLight}
            />
            <Text
              style={[
                styles.noiseLabel,
                noise === opt.value && styles.noiseLabelActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Available */}
      <Text style={styles.sectionTitle}>Time available?</Text>
      <View style={styles.timeRow}>
        {TIME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.timeChip,
              time === opt.value && styles.timeChipActive,
            ]}
            onPress={() => setTime(opt.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeLabel,
                time === opt.value && styles.timeLabelActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, !isReady && styles.generateButtonDisabled]}
        onPress={generateSuggestion}
        disabled={!isReady}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={20} color={COLORS.white} />
        <Text style={styles.generateText}>Generate Calm Plan</Text>
      </TouchableOpacity>

      {/* Results */}
      {result && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Your Calm Plan</Text>

          <View style={[styles.resultCard, { borderLeftColor: COLORS.secondary }]}>
            <View style={styles.resultHeader}>
              <Ionicons name={result.activity.icon as any} size={22} color={COLORS.secondary} />
              <Text style={styles.resultLabel}>Calming Activity</Text>
            </View>
            <Text style={styles.resultName}>{result.activity.name}</Text>
            <Text style={styles.resultDesc}>{result.activity.description}</Text>
            <Text style={styles.resultDuration}>{result.activity.duration}</Text>
          </View>

          <View style={[styles.resultCard, { borderLeftColor: COLORS.primary }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="chatbubble-outline" size={22} color={COLORS.primary} />
              <Text style={styles.resultLabel}>Grounding Prompt</Text>
            </View>
            <Text style={styles.resultDesc}>{result.prompt}</Text>
          </View>

          <View style={[styles.resultCard, { borderLeftColor: COLORS.purple }]}>
            <View style={styles.resultHeader}>
              <Ionicons name={result.tool.icon as any} size={22} color={COLORS.purple} />
              <Text style={styles.resultLabel}>Regulation Tool</Text>
            </View>
            <Text style={styles.resultName}>{result.tool.name}</Text>
            <Text style={styles.resultDesc}>{result.tool.description}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  chipLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  noiseRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  noiseChip: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  noiseChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  noiseLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  noiseLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  timeChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  timeLabelActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.medium,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  generateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  results: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  resultLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  resultDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
