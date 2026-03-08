import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

interface QuickTileProps {
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  size?: 'normal' | 'large';
}

export default function QuickTile({
  title,
  subtitle,
  icon,
  color,
  bgColor,
  onPress,
  size = 'normal',
}: QuickTileProps) {
  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: bgColor }, size === 'large' && styles.tileLarge]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon as any} size={size === 'large' ? 32 : 28} color={color} />
      </View>
      <Text style={[styles.title, size === 'large' && styles.titleLarge]} numberOfLines={2}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    ...SHADOWS.small,
  },
  tileLarge: {
    minHeight: 150,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  titleLarge: {
    fontSize: FONT_SIZES.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
});
