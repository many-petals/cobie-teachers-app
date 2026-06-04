import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BRAND, LOCAL_LOGO } from '../data/brand';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../data/theme';

type BrandLockupProps = {
  size?: 'sm' | 'md' | 'lg';
  mode?: 'plain' | 'pill' | 'hero';
  style?: StyleProp<ViewStyle>;
  showHelper?: boolean;
};

const SIZE_MAP = {
  sm: { image: 36, title: FONT_SIZES.md, subtitle: 10, helper: FONT_SIZES.xs },
  md: { image: 48, title: FONT_SIZES.lg, subtitle: FONT_SIZES.xs, helper: FONT_SIZES.xs },
  lg: { image: 60, title: FONT_SIZES.xl, subtitle: FONT_SIZES.sm, helper: FONT_SIZES.sm },
} as const;

export default function BrandLockup({
  size = 'md',
  mode = 'plain',
  style,
  showHelper = false,
}: BrandLockupProps) {
  const settings = SIZE_MAP[size];

  return (
    <View style={[styles.base, mode === 'pill' && styles.pill, mode === 'hero' && styles.hero, style]}>
      <Image
        source={LOCAL_LOGO as ImageSourcePropType}
        style={[
          styles.logo,
          {
            width: settings.image,
            height: settings.image,
            borderRadius: size === 'lg' ? RADIUS.lg : RADIUS.md,
          },
        ]}
        resizeMode="cover"
      />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { fontSize: settings.title }]} numberOfLines={1}>
          {BRAND.shortName}
        </Text>
        <Text style={[styles.subtitle, { fontSize: settings.subtitle }]} numberOfLines={1}>
          {BRAND.tagline}
        </Text>
        {showHelper ? (
          <Text style={[styles.helper, { fontSize: settings.helper }]} numberOfLines={2}>
            {BRAND.helperLine}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(27,107,147,0.12)',
    ...SHADOWS.small,
  },
  hero: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9, 37, 56, 0.26)',
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logo: {
    backgroundColor: COLORS.white,
  },
  textWrap: {
    flexShrink: 1,
  },
  title: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  subtitle: {
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  helper: {
    marginTop: 2,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});
