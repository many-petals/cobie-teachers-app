import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BRAND, LOCAL_WORDMARK } from '../data/brand';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../data/theme';

type BrandLockupProps = {
  size?: 'sm' | 'md' | 'lg';
  mode?: 'plain' | 'pill' | 'hero';
  style?: StyleProp<ViewStyle>;
  showSubtitle?: boolean;
  showHelper?: boolean;
};

const SIZE_MAP = {
  sm: { wordmarkWidth: 168, wordmarkHeight: 52, subtitle: 10, helper: FONT_SIZES.xs },
  md: { wordmarkWidth: 196, wordmarkHeight: 60, subtitle: FONT_SIZES.xs, helper: FONT_SIZES.xs },
  lg: { wordmarkWidth: 236, wordmarkHeight: 72, subtitle: FONT_SIZES.sm, helper: FONT_SIZES.sm },
} as const;

export default function BrandLockup({
  size = 'md',
  mode = 'plain',
  style,
  showSubtitle = false,
  showHelper = false,
}: BrandLockupProps) {
  const settings = SIZE_MAP[size];
  const subtitleColor = mode === 'hero' ? 'rgba(255,255,255,0.82)' : COLORS.textMuted;

  return (
    <View style={[styles.base, mode === 'pill' && styles.pill, mode === 'hero' && styles.hero, style]}>
      <Image
        source={LOCAL_WORDMARK as ImageSourcePropType}
        style={[
          styles.wordmark,
          {
            width: settings.wordmarkWidth,
            height: settings.wordmarkHeight,
          },
        ]}
        resizeMode="contain"
      />
      {showSubtitle ? (
        <Text style={[styles.subtitle, { fontSize: settings.subtitle, color: subtitleColor }]} numberOfLines={1}>
          {BRAND.tagline}
        </Text>
      ) : null}
      {showHelper ? (
        <Text
          style={[
            styles.helper,
            { fontSize: settings.helper },
            mode === 'hero' ? styles.heroHelper : styles.defaultHelper,
          ]}
          numberOfLines={2}
        >
          {BRAND.helperLine}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    minWidth: 0,
    flexShrink: 1,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(27,107,147,0.12)',
    ...SHADOWS.small,
  },
  hero: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9,37,56,0.24)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  wordmark: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  helper: {
    marginTop: 3,
    lineHeight: 18,
  },
  defaultHelper: {
    color: COLORS.textLight,
  },
  heroHelper: {
    color: 'rgba(255,255,255,0.72)',
  },
});
