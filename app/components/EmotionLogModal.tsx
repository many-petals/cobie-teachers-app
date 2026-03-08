import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { EMOTIONS } from '../data/emotions';

const CONTEXT_OPTIONS = [
  { id: 'morning', label: 'Morning arrival', icon: 'sunny-outline' },
  { id: 'circle', label: 'Circle time', icon: 'people-outline' },
  { id: 'lesson', label: 'During lesson', icon: 'book-outline' },
  { id: 'playtime', label: 'Playtime', icon: 'football-outline' },
  { id: 'lunchtime', label: 'Lunchtime', icon: 'restaurant-outline' },
  { id: 'transition', label: 'Transition', icon: 'swap-horizontal-outline' },
  { id: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
  { id: 'end-of-day', label: 'End of day', icon: 'moon-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onLog: (data: {
    emotion_id: string;
    emotion_name: string;
    context: string;
    notes: string;
  }) => void;
  pupilCode: string;
}

export default function EmotionLogModal({ visible, onClose, onLog, pupilCode }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'emotion' | 'context'>('emotion');

  const emotion = EMOTIONS.find(e => e.id === selectedEmotion);

  const handleSelectEmotion = (id: string) => {
    setSelectedEmotion(id);
    setStep('context');
  };

  const handleSave = () => {
    if (!emotion) return;
    onLog({
      emotion_id: emotion.id,
      emotion_name: emotion.name,
      context: selectedContext,
      notes: notes.trim(),
    });
    // Reset
    setSelectedEmotion(null);
    setSelectedContext('');
    setNotes('');
    setStep('emotion');
    onClose();
  };

  const handleClose = () => {
    setSelectedEmotion(null);
    setSelectedContext('');
    setNotes('');
    setStep('emotion');
    onClose();
  };

  const handleBack = () => {
    setStep('emotion');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step === 'context' && (
                <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.headerTitle}>Log Emotion</Text>
                <Text style={styles.headerSub}>Pupil: {pupilCode}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {step === 'emotion' ? (
              <>
                {/* Step 1: Select Emotion */}
                <Text style={styles.stepTitle}>How is {pupilCode} feeling?</Text>
                <Text style={styles.stepSub}>Select the emotion you've observed</Text>

                <View style={styles.emotionGrid}>
                  {EMOTIONS.map(em => (
                    <TouchableOpacity
                      key={em.id}
                      style={[
                        styles.emotionCard,
                        { backgroundColor: em.bgColor, borderColor: em.color },
                        selectedEmotion === em.id && { borderWidth: 3 },
                      ]}
                      onPress={() => handleSelectEmotion(em.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={em.icon as any} size={32} color={em.color} />
                      <Text style={[styles.emotionLabel, { color: em.color }]}>{em.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* Step 2: Context + Notes */}
                {emotion && (
                  <View style={[styles.selectedBanner, { backgroundColor: emotion.bgColor }]}>
                    <Ionicons name={emotion.icon as any} size={28} color={emotion.color} />
                    <View style={styles.selectedInfo}>
                      <Text style={[styles.selectedName, { color: emotion.color }]}>
                        {emotion.name}
                      </Text>
                      <Text style={styles.selectedDesc}>{emotion.childFriendly}</Text>
                    </View>
                  </View>
                )}

                <Text style={styles.stepTitle}>When did you notice this?</Text>
                <Text style={styles.stepSub}>Optional: add context for better tracking</Text>

                <View style={styles.contextGrid}>
                  {CONTEXT_OPTIONS.map(ctx => (
                    <TouchableOpacity
                      key={ctx.id}
                      style={[
                        styles.contextChip,
                        selectedContext === ctx.id && styles.contextChipActive,
                      ]}
                      onPress={() => setSelectedContext(selectedContext === ctx.id ? '' : ctx.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={ctx.icon as any}
                        size={16}
                        color={selectedContext === ctx.id ? COLORS.white : COLORS.textLight}
                      />
                      <Text
                        style={[
                          styles.contextChipText,
                          selectedContext === ctx.id && styles.contextChipTextActive,
                        ]}
                      >
                        {ctx.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.notesLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Triggered by loud noise in hall, calmed with deep breathing..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {/* Calming strategy suggestion */}
                {emotion && (
                  <View style={[styles.strategyTip, { backgroundColor: emotion.bgColor }]}>
                    <Ionicons name="bulb-outline" size={18} color={emotion.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.strategyTipTitle, { color: emotion.color }]}>
                        Suggested Strategy
                      </Text>
                      <Text style={styles.strategyTipText}>{emotion.calmingStrategy}</Text>
                    </View>
                  </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: emotion?.color || COLORS.primary }]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Log Emotion for {pupilCode}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.bgLight,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '92%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  // Emotion grid
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  emotionCard: {
    width: '29%',
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...SHADOWS.small,
  },
  emotionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  // Selected banner
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  selectedDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
    lineHeight: 18,
  },
  // Context grid
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  contextChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contextChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  contextChipTextActive: {
    color: COLORS.white,
  },
  // Notes
  notesLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    minHeight: 80,
    marginBottom: SPACING.lg,
  },
  // Strategy tip
  strategyTip: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  strategyTipTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  strategyTipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  saveBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
