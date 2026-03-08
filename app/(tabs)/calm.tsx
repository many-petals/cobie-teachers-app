import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { CALMING_ACTIVITIES, GROUNDING_PROMPTS, REGULATION_TOOLS } from '../data/emotions';
import SENBanner from '../components/SENBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

// Safe date formatter that avoids hydration mismatches
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

export default function CalmScreen() {
  const { saveCalmConfig, savedCalmConfigs, deleteCalmConfig } = useAuth();
  const { showToast } = useToast();
  const [emotion, setEmotion] = useState('');
  const [noise, setNoise] = useState('');
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<{
    activity: typeof CALMING_ACTIVITIES[0];
    prompt: string;
    tool: typeof REGULATION_TOOLS[0];
  } | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const generateSuggestion = () => {
    if (!emotion || !noise || !time) return;
    const activityIndex = (emotion.length + time) % CALMING_ACTIVITIES.length;
    const promptIndex = (emotion.length + noise.length) % GROUNDING_PROMPTS.length;
    const toolIndex = (noise.length + time) % REGULATION_TOOLS.length;
    setResult({
      activity: CALMING_ACTIVITIES[activityIndex],
      prompt: GROUNDING_PROMPTS[promptIndex],
      tool: REGULATION_TOOLS[toolIndex],
    });
  };

  const handleSaveConfig = async () => {
    if (!emotion || !noise || !time) return;
    const emotionLabel = EMOTION_OPTIONS.find(e => e.value === emotion)?.label || emotion;
    const noiseLabel = NOISE_OPTIONS.find(n => n.value === noise)?.label || noise;
    await saveCalmConfig({
      name: `${emotionLabel} - ${noiseLabel} - ${time}min`,
      emotion,
      noise,
      time_available: time,
    });
    showToast('Saved!', 'This calm plan has been saved locally.', 'success');
  };

  const loadConfig = (config: typeof savedCalmConfigs[0]) => {
    setEmotion(config.emotion);
    setNoise(config.noise);
    setTime(config.time_available);
    setShowSaved(false);
    // Auto-generate
    setTimeout(() => {
      const activityIndex = (config.emotion.length + config.time_available) % CALMING_ACTIVITIES.length;
      const promptIndex = (config.emotion.length + config.noise.length) % GROUNDING_PROMPTS.length;
      const toolIndex = (config.noise.length + config.time_available) % REGULATION_TOOLS.length;
      setResult({
        activity: CALMING_ACTIVITIES[activityIndex],
        prompt: GROUNDING_PROMPTS[promptIndex],
        tool: REGULATION_TOOLS[toolIndex],
      });
    }, 100);
  };

  const isReady = emotion && noise && time > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="leaf" size={24} color={COLORS.secondary} />
          <Text style={styles.headerTitle}>Calm Corner</Text>
        </View>
        {savedCalmConfigs.length > 0 ? (
          <TouchableOpacity
            style={styles.savedBtn}
            onPress={() => setShowSaved(!showSaved)}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmarks" size={16} color={COLORS.primary} />
            <Text style={styles.savedBtnText}>Saved ({savedCalmConfigs.length})</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <SENBanner />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Select the child's current emotional state, noise level, and available time.
          The builder will suggest a personalised calming plan.
        </Text>

        {/* Saved configs dropdown */}
        {showSaved && savedCalmConfigs.length > 0 ? (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Quick Load Saved Plans</Text>
            {savedCalmConfigs.map((config) => (
              <View key={config.id} style={styles.savedItem}>
                <TouchableOpacity style={styles.savedItemContent} onPress={() => loadConfig(config)} activeOpacity={0.7}>
                  <Ionicons name="leaf" size={16} color={COLORS.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedItemName}>{config.name}</Text>
                    <Text style={styles.savedItemDate}>
                      {formatDate(config.created_at)}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteCalmConfig(config.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

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
              style={[styles.noiseChip, noise === opt.value && styles.noiseChipActive]}
              onPress={() => setNoise(opt.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon as any}
                size={22}
                color={noise === opt.value ? COLORS.white : COLORS.textLight}
              />
              <Text style={[styles.noiseLabel, noise === opt.value && styles.noiseLabelActive]}>
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
              style={[styles.timeChip, time === opt.value && styles.timeChipActive]}
              onPress={() => setTime(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeLabel, time === opt.value && styles.timeLabelActive]}>
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
        {result ? (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Your Calm Plan</Text>
              <TouchableOpacity onPress={handleSaveConfig} style={styles.saveConfigBtn} activeOpacity={0.7}>
                <Ionicons name="bookmark-outline" size={16} color={COLORS.primary} />
                <Text style={styles.saveConfigText}>Save</Text>
              </TouchableOpacity>
            </View>

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
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  savedBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.primary + '30' },
  savedBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
  container: { flex: 1, padding: SPACING.lg },
  intro: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginBottom: SPACING.sm },
  savedSection: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, ...SHADOWS.small },
  savedTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  savedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  savedItemContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.bgGreen, padding: SPACING.md, borderRadius: RADIUS.md },
  savedItemName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  savedItemDate: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  deleteBtn: { padding: SPACING.sm, marginLeft: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emotionChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  chipLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '500' },
  noiseRow: { flexDirection: 'row', gap: SPACING.sm },
  noiseChip: { flex: 1, alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  noiseChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  noiseLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '500' },
  noiseLabelActive: { color: COLORS.white, fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: SPACING.sm },
  timeChip: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  timeChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  timeLabel: { fontSize: FONT_SIZES.md, color: COLORS.textLight, fontWeight: '600' },
  timeLabelActive: { color: COLORS.text, fontWeight: '700' },
  generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.secondary, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.xl, ...SHADOWS.medium },
  generateButtonDisabled: { backgroundColor: COLORS.mediumGray },
  generateText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.white },
  results: { marginTop: SPACING.xl, gap: SPACING.md },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  resultsTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  saveConfigBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.primary + '30' },
  saveConfigText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
  resultCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, borderLeftWidth: 4, ...SHADOWS.small },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  resultLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  resultDesc: { fontSize: FONT_SIZES.md, color: COLORS.textLight, lineHeight: 22 },
  resultDuration: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 4 },
});
