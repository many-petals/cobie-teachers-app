import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

interface ResourceCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor?: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
  compact?: boolean;
  rightIcon?: string;
}

export default function ResourceCard({
  title,
  subtitle,
  icon,
  color,
  bgColor,
  badge,
  badgeColor,
  onPress,
  compact = false,
  rightIcon = 'chevron-forward',
}: ResourceCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact && styles.cardCompact,
        { borderLeftColor: color, borderLeftWidth: 4 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor || color + '20' }]}>
        <Ionicons name={icon as any} size={compact ? 22 : 26} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor || color + '20' }]}>
          <Text style={[styles.badgeText, { color: color }]}>{badge}</Text>
        </View>
      )}
      <Ionicons name={rightIcon as any} size={18} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardCompact: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
  },
  titleCompact: {
    fontSize: FONT_SIZES.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginRight: SPACING.sm,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
