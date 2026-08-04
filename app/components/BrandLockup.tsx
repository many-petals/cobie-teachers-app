import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BRAND, LOCAL_LOGO, LOCAL_WORDMARK } from '../data/brand';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../data/theme';

type BrandLockupProps = {
  size?: 'sm' | 'md' | 'lg';
  mode?: 'plain' | 'pill' | 'hero' | 'wordmark';
  style?: StyleProp<ViewStyle>;
  showSubtitle?: boolean;
  showHelper?: boolean;
};

const SIZE_MAP = {
  sm: {
    markSize: 34,
    title: 15,
    subtitle: 10,
    helper: FONT_SIZES.xs,
    gap: SPACING.sm,
    wordmarkWidth: 196,
    wordmarkHeight: 64,
  },
  md: {
    markSize: 42,
    title: 18,
    subtitle: 11,
    helper: FONT_SIZES.xs,
    gap: SPACING.md,
    wordmarkWidth: 236,
    wordmarkHeight: 76,
  },
  lg: {
    markSize: 52,
    title: 22,
    subtitle: FONT_SIZES.sm,
    helper: FONT_SIZES.sm,
    gap: SPACING.md,
    wordmarkWidth: 290,
    wordmarkHeight: 94,
  },
} as const;

export default function BrandLockup({
  size = 'md',
  mode = 'plain',
  style,
  showSubtitle,
  showHelper = false,
}: BrandLockupProps) {
  const settings = SIZE_MAP[size];
  const useWordmark = mode === 'wordmark';
  const shouldShowSubtitle = showSubtitle ?? !useWordmark;

  if (useWordmark) {
    return (
      <View style={[styles.base, style]}>
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
        {shouldShowSubtitle ? (
          <Text style={[styles.wordmarkSubtitle, { fontSize: settings.subtitle }]} numberOfLines={1}>
            {BRAND.tagline}
          </Text>
        ) : null}
        {showHelper ? (
          <Text style={[styles.helper, styles.defaultHelper, { fontSize: settings.helper }]} numberOfLines={2}>
            {BRAND.helperLine}
          </Text>
        ) : null}
      </View>
    );
  }

  const titleColor = mode === 'hero' ? '#213A2E' : '#213A2E';
  const subtitleColor = mode === 'hero' ? '#6F7F76' : '#7C8A81';

  return (
    <View style={[styles.base, mode === 'pill' && styles.pill, mode === 'hero' && styles.hero, style]}>
      <View style={styles.row}>
        <View
          style={[
            styles.markWrap,
            {
              width: settings.markSize,
              height: settings.markSize,
              borderRadius: Math.round(settings.markSize * 0.32),
            },
            mode === 'hero' ? styles.markWrapHero : styles.markWrapDefault,
          ]}
        >
          <Image
            source={LOCAL_LOGO as ImageSourcePropType}
            style={styles.mark}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.copy, { gap: size === 'lg' ? 4 : 2 }]}>
          <Text style={[styles.title, { fontSize: settings.title, color: titleColor }]} numberOfLines={1}>
            {BRAND.shortName}
          </Text>
          {shouldShowSubtitle ? (
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    minWidth: 0,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(33,58,46,0.08)',
    ...SHADOWS.small,
  },
  hero: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(33,58,46,0.08)',
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  markWrapDefault: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: 'rgba(216,156,25,0.18)',
  },
  markWrapHero: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: 'rgba(216,156,25,0.18)',
  },
  mark: {
    width: '100%',
    height: '100%',
  },
  copy: {
    minWidth: 0,
    flexShrink: 1,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  helper: {
    marginTop: 2,
    lineHeight: 18,
  },
  defaultHelper: {
    color: COLORS.textLight,
  },
  heroHelper: {
    color: '#7C8A81',
  },
  wordmark: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  wordmarkSubtitle: {
    marginTop: 2,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
