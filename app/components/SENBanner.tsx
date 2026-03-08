import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../data/theme';
import { useSEN } from '../context/SENContext';

export default function SENBanner() {
  const { senMode, toggleSENMode } = useSEN();

  return (
    <TouchableOpacity
      style={[styles.banner, senMode && styles.bannerActive]}
      onPress={toggleSENMode}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Ionicons
          name={senMode ? 'accessibility' : 'accessibility-outline'}
          size={20}
          color={senMode ? COLORS.white : COLORS.purple}
        />
        <Text style={[styles.text, senMode && styles.textActive]}>
          SEN Mode {senMode ? 'ON' : 'OFF'}
        </Text>
      </View>
      <View style={[styles.toggle, senMode && styles.toggleActive]}>
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
  bannerActive: {
    backgroundColor: COLORS.purple,
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
