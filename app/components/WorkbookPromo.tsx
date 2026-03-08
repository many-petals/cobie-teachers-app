import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

const WORKBOOK_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/6993b5b66d45d72ccfd31c24_1771291498634_bbc463f2.jpg';

// This would be updated with the real Amazon link once the workbook is published
const AMAZON_URL = 'https://www.amazon.co.uk';

interface WorkbookPromoProps {
  compact?: boolean;
}

export default function WorkbookPromo({ compact = false }: WorkbookPromoProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleBuyNow = () => {
    Linking.openURL(AMAZON_URL).catch(() => {});
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleBuyNow} activeOpacity={0.7}>
        <View style={styles.compactLeft}>
          <View style={styles.compactBadge}>
            <Ionicons name="book" size={14} color={COLORS.white} />
            <Text style={styles.compactBadgeText}>NEW</Text>
          </View>
          <Text style={styles.compactTitle}>Cobie Activity Workbook</Text>
          <Text style={styles.compactSubtitle}>Extended print edition on Amazon</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactPrice}>From £8.99</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => setDismissed(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.newBadge}>
          <Ionicons name="sparkles" size={12} color={COLORS.white} />
          <Text style={styles.newBadgeText}>Print Edition</Text>
        </View>
        <Text style={styles.title}>Cobie the Cactus Activity Workbook</Text>
        <Text style={styles.subtitle}>
          The extended print companion to this app
        </Text>
      </View>

      <View style={styles.contentRow}>
        <Image
          source={{ uri: WORKBOOK_IMAGE }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={styles.details}>
          <Text style={styles.description}>
            40+ pages of classroom-ready worksheets, colouring pages, and activities 
            that mirror and extend the digital resources in this app.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
              <Text style={styles.featureText}>Photocopiable worksheets</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
              <Text style={styles.featureText}>EYFS & KS1 aligned</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
              <Text style={styles.featureText}>SEN-friendly layouts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
              <Text style={styles.featureText}>Assessment checklists included</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>£8.99</Text>
            <Text style={styles.priceNote}>Paperback on Amazon</Text>
          </View>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuyNow}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={18} color={COLORS.white} />
            <Text style={styles.buyButtonText}>View on Amazon</Text>
          </TouchableOpacity>

          <Text style={styles.schoolNote}>
            School bulk orders available - contact us for discounts on 10+ copies
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.accent,
    ...SHADOWS.medium,
    position: 'relative',
  },
  dismissBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentOrange,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  newBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  contentRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  bookImage: {
    width: 110,
    height: 150,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgLight,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  featureList: {
    gap: 6,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  buyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  schoolNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  compactLeft: {
    flex: 1,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.accentOrange,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
    marginBottom: 4,
  },
  compactBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  compactTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  compactSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  compactRight: {
    alignItems: 'center',
    gap: 4,
  },
  compactPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
