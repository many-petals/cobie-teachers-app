import React from 'react';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandLockup from './BrandLockup';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../data/theme';

type BrandedScreenHeaderProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function BrandedScreenHeader({
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary,
  leftAction,
  rightAction,
  style,
}: BrandedScreenHeaderProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.topRow}>
        <BrandLockup size="sm" mode="plain" showSubtitle={false} />
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>

      <View style={styles.titleRow}>
        {leftAction ? <View style={styles.leftAction}>{leftAction}</View> : null}
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1F` }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  leftAction: {
    marginRight: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.sm,
    lineHeight: 19,
    color: COLORS.textLight,
  },
});
