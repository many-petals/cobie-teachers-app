import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { Emotion } from '../data/emotions';
import { useSEN } from '../context/SENContext';

interface EmotionCardProps {
  emotion: Emotion;
  isExpanded: boolean;
  onPress: () => void;
}

export default function EmotionCard({ emotion, isExpanded, onPress }: EmotionCardProps) {
  const { senMode } = useSEN();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: emotion.bgColor, borderColor: emotion.color },
        isExpanded && styles.cardExpanded,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: emotion.color + '30' }]}>
          <Ionicons name={emotion.icon as any} size={32} color={emotion.color} />
        </View>
        <Text style={[styles.name, { color: emotion.color }]}>{emotion.name}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={emotion.color}
        />
      </View>

      {isExpanded && (
        <View style={styles.details}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.sectionTitle}>
                {senMode ? 'What it means' : 'Child-Friendly Explanation'}
              </Text>
            </View>
            <Text style={[styles.sectionText, senMode && styles.senText]}>
              {emotion.childFriendly}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="body-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.sectionTitle}>Body Clues</Text>
            </View>
            <Text style={[styles.sectionText, senMode && styles.senText]}>
              {emotion.bodyClue}
            </Text>
          </View>

          <View style={[styles.section, styles.strategySection, { backgroundColor: emotion.color + '15' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf-outline" size={16} color={emotion.color} />
              <Text style={[styles.sectionTitle, { color: emotion.color }]}>
                Calming Strategy
              </Text>
            </View>
            <Text style={[styles.sectionText, senMode && styles.senText, { color: COLORS.text }]}>
              {emotion.calmingStrategy}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  cardExpanded: {
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  details: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    paddingLeft: SPACING.xl,
  },
  senText: {
    fontSize: FONT_SIZES.lg,
    lineHeight: 26,
  },
  strategySection: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
});
