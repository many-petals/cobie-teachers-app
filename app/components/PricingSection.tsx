import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PLANS = [
  {
    id: 'free',
    name: 'Free Preview',
    price: '£0',
    period: '',
    description: 'Try the core features',
    color: COLORS.mediumGray,
    features: [
      { label: 'View all 4 lesson outlines', included: true },
      { label: 'Lesson 1 full player access', included: true },
      { label: '3 sample printables', included: true },
      { label: 'Emotion cards tool', included: true },
      { label: 'Full lesson player (all 4)', included: false },
      { label: 'All 18 printable resources', included: false },
      { label: 'Pupil progress tracker', included: false },
      { label: 'Calm Corner builder', included: false },
      { label: 'Assessment checklists', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    price: '£2.99',
    period: '/month',
    description: 'Full access for one teacher',
    color: COLORS.primary,
    features: [
      { label: 'All 4 lesson players', included: true },
      { label: 'All 18 printable resources', included: true },
      { label: 'All 8 optional activities', included: true },
      { label: 'Pupil progress tracker', included: true },
      { label: 'Calm Corner builder', included: true },
      { label: 'Emotion check-in tools', included: true },
      { label: 'SEN differentiation mode', included: true },
      { label: 'Save favourites & progress', included: true },
      { label: 'School-wide dashboard', included: false },
    ],
    cta: 'Start Free 14 Day Free Trial',
    popular: true,
  },
  {
    id: 'school',
    name: 'School',
    price: '£14.99',
    period: '/month',
    description: 'Whole-school access',
    color: COLORS.secondary,
    features: [
      { label: 'Everything in Teacher plan', included: true },
      { label: 'Unlimited teacher accounts', included: true },
      { label: 'School-wide pupil tracker', included: true },
      { label: 'Shared calm corner configs', included: true },
      { label: 'Bulk printable downloads', included: true },
      { label: 'Priority support', included: true },
      { label: 'CPD training resources', included: true },
      { label: 'Annual billing discount (20%)', included: true },
      { label: 'Custom branding option', included: true },
    ],
    cta: 'Contact Us',
    popular: false,
  },
];

interface PricingSectionProps {
  visible: boolean;
  onClose: () => void;
}

export default function PricingSection({ visible, onClose }: PricingSectionProps) {
  const { user, setShowAuthModal } = useAuth();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      showToast('Free Plan', 'You are already on the free plan.', 'info');
      return;
    }
    if (!user) {
      setShowAuthModal(true);
      onClose();
      return;
    }
    if (planId === 'school') {
      showToast(
        'School Plan',
        'Please email schools@manypetals.co.uk for school licensing.',
        'info'
      );
      return;
    }
    setSelectedPlan(planId);
    showToast(
      'Coming Soon',
      'Subscriptions launching soon. You currently have full preview access.',
      'info'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Choose Your Plan</Text>
              <Text style={styles.headerSubtitle}>
                Support Cobie Teacher Pack development
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Value proposition */}
            <View style={styles.valueBar}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.secondary} />
              <Text style={styles.valueText}>
                14-day free trial on all paid plans. Cancel anytime.
              </Text>
            </View>

            {PLANS.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.popular && styles.planCardPopular,
                ]}
              >
                {plan.popular ? (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={12} color={COLORS.white} />
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                ) : null}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.priceWrap}>
                    <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                    {plan.period ? (
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.featureList}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureItem}>
                      <Ionicons
                        name={feature.included ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={feature.included ? COLORS.secondary : COLORS.lightGray}
                      />
                      <Text style={[
                        styles.featureText,
                        !feature.included && styles.featureTextDisabled,
                      ]}>
                        {feature.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.planButton,
                    plan.popular && { backgroundColor: plan.color },
                    plan.id === 'free' && styles.planButtonFree,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.planButtonText,
                    plan.popular && { color: COLORS.white },
                    plan.id === 'free' && styles.planButtonTextFree,
                  ]}>
                    {plan.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* FAQ */}
            <View style={styles.faqSection}>
              <Text style={styles.faqTitle}>Common Questions</Text>
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>Can I try before I buy?</Text>
                <Text style={styles.faqA}>
                  Yes! The free plan gives you access to Lesson 1, sample printables, 
                  and the emotion tools. All paid plans include a 14-day free trial.
                </Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>How does school licensing work?</Text>
                <Text style={styles.faqA}>
                  The School plan covers unlimited teachers at one school. 
                  Contact us for multi-academy trust pricing.
                </Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>Where does my money go?</Text>
                <Text style={styles.faqA}>
                  Your subscription directly funds hosting, development, and the creation 
                  of new resources. We are a small independent publisher.
                </Text>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.bgLight,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '95%',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgGreen,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  valueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  planCardPopular: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  popularText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  planDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  featureList: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  featureTextDisabled: {
    color: COLORS.mediumGray,
  },
  planButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  planButtonFree: {
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  planButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  planButtonTextFree: {
    color: COLORS.textMuted,
  },
  faqSection: {
    marginTop: SPACING.lg,
  },
  faqTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  faqQ: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  faqA: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});
