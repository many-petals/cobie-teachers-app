import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../data/theme';
import { useSEN } from '../context/SENContext';

interface SENBannerProps {
  compact?: boolean;
}

export default function SENBanner({ compact = false }: SENBannerProps) {
  const { senMode, toggleSENMode } = useSEN();

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        compact && styles.bannerCompact,
        senMode && styles.bannerActive,
        compact && senMode && styles.bannerCompactActive,
      ]}
      onPress={toggleSENMode}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Ionicons
          name={senMode ? 'accessibility' : 'accessibility-outline'}
          size={compact ? 16 : 20}
          color={senMode ? COLORS.white : compact ? '#5C8A4D' : COLORS.purple}
        />
        <Text style={[styles.text, compact && styles.textCompact, senMode && styles.textActive]}>
          SEN Mode {senMode ? 'ON' : 'OFF'}
        </Text>
      </View>
      <View style={[styles.toggle, compact && styles.toggleCompact, senMode && styles.toggleActive]}>
        <View style={[styles.toggleDot, senMode && styles.toggleDotActive]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  bannerCompact: {
    marginHorizontal: 0,
    marginTop: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: '#EEF7EA',
    borderWidth: 1,
    borderColor: '#D8EBCF',
  },
  bannerActive: {
    backgroundColor: COLORS.purple,
  },
  bannerCompactActive: {
    backgroundColor: '#6E9B63',
    borderColor: '#6E9B63',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
  },
  textCompact: {
    fontSize: 12,
    color: '#5C8A4D',
  },
  textActive: {
    color: COLORS.white,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 2,
    justifyContent: 'center',
  },
  toggleCompact: {
    width: 36,
    height: 20,
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: COLORS.white,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.mediumGray,
  },
  toggleDotActive: {
    backgroundColor: COLORS.purple,
    alignSelf: 'flex-end',
  },
});
