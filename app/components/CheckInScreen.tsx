import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { EMOTIONS } from '../data/emotions';
import { addEmotionLog } from '../lib/storage';

interface Props {
  pupilCode?: string;
  pupilId?: string;
  onEmotionLogged?: (emotionId: string, emotionName: string) => void;
}

export default function CheckInScreen({ pupilCode, pupilId, onEmotionLogged }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedEmotion = EMOTIONS.find((e) => e.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!selectedEmotion) return;
    setSaving(true);
    
    try {
      // Save to local storage
      await addEmotionLog({
        pupil_id: pupilId,
        pupil_code: pupilCode || 'Anonymous',
        emotion_id: selectedEmotion.id,
        emotion_name: selectedEmotion.name,
        context: 'checkin',
        notes: '',
        logged_at: new Date().toISOString(),
      });
      
      // Notify parent component
      if (onEmotionLogged) {
        onEmotionLogged(selectedEmotion.id, selectedEmotion.name);
      }
    } catch (err) {
      console.warn('Failed to save check-in:', err);
    }
    
    setSaving(false);
    setConfirmed(true);
  };

  const handleReset = () => {
    setSelected(null);
    setConfirmed(false);
  };

  if (confirmed && selectedEmotion) {
    return (
      <View style={styles.confirmedContainer}>
        <View style={[styles.bigEmoji, { backgroundColor: selectedEmotion.bgColor }]}>
          <Ionicons name={selectedEmotion.icon as any} size={80} color={selectedEmotion.color} />
        </View>
        <Text style={styles.confirmedTitle}>
          You're feeling {selectedEmotion.name}
        </Text>
        <Text style={styles.confirmedText}>{selectedEmotion.childFriendly}</Text>
        
        {/* Saved confirmation */}
        <View style={styles.savedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.savedText}>Saved to your emotion log</Text>
        </View>
        
        <View style={[styles.strategyBox, { backgroundColor: selectedEmotion.bgColor }]}>
          <Ionicons name="leaf" size={20} color={selectedEmotion.color} />
          <Text style={styles.strategyText}>{selectedEmotion.calmingStrategy}</Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
          <Text style={styles.resetText}>Check in again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you feel today?</Text>
      <Text style={styles.subtitle}>Tap the face that matches how you feel right now</Text>

      {pupilCode && (
        <View style={styles.pupilBadge}>
          <Ionicons name="person" size={14} color={COLORS.primary} />
          <Text style={styles.pupilBadgeText}>Checking in as: {pupilCode}</Text>
        </View>
      )}

      <View style={styles.grid}>
        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              { backgroundColor: emotion.bgColor, borderColor: emotion.color },
              selected === emotion.id && styles.emotionButtonSelected,
              selected === emotion.id && { borderColor: emotion.color, borderWidth: 3 },
            ]}
            onPress={() => handleSelect(emotion.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={emotion.icon as any}
              size={36}
              color={emotion.color}
            />
            <Text style={[styles.emotionLabel, { color: emotion.color }]}>
              {emotion.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selected && (
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: selectedEmotion?.color || COLORS.primary }]}
          onPress={handleConfirm}
          activeOpacity={0.7}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
          <Text style={styles.confirmText}>
            {saving ? 'Saving...' : "That's how I feel!"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  pupilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  pupilBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  emotionButton: {
    width: '30%',
    minWidth: 95,
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...SHADOWS.small,
  },
  emotionButtonSelected: {
    transform: [{ scale: 1.05 }],
    ...SHADOWS.medium,
  },
  emotionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.medium,
  },
  confirmText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  confirmedContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  bigEmoji: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  confirmedTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  confirmedText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 26,
    paddingHorizontal: SPACING.lg,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    marginTop: SPACING.md,
  },
  savedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  strategyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xl,
    width: '100%',
  },
  strategyText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    marginTop: SPACING.xl,
  },
  resetText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
