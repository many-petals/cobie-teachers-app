import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

const EVIDENCE_ITEMS = [
  {
    source: 'Education Endowment Foundation',
    finding: 'PSED approaches have a positive impact on social-emotional skills and self-regulation. Teaching and modelling managing emotions particularly benefits disadvantaged children.',
    url: 'https://educationendowmentfoundation.org.uk/early-years/evidence-store/personal-social-and-emotional-development',
    icon: 'school' as const,
    color: '#1B6B93',
  },
  {
    source: 'EYFS Statutory Framework 2025',
    finding: 'PSED is crucial for healthy, happy lives and is fundamental to cognitive development. Children should be supported to manage emotions and develop a positive sense of self.',
    url: 'https://www.gov.uk/government/publications/early-years-foundation-stage-framework--2',
    icon: 'document-text' as const,
    color: '#7BC67E',
  },
  {
    source: 'Education 3-13 (Taylor & Francis, 2025)',
    finding: 'Post-COVID, the current EYFS conception of emotional development may not be sufficient. New approaches are needed to address emerging PSED challenges.',
    url: 'https://www.tandfonline.com/doi/full/10.1080/03004279.2025.2510700',
    icon: 'flask' as const,
    color: '#B39DDB',
  },
  {
    source: 'Bristol Early Years / Dan Hughes',
    finding: 'The PACE model (Playfulness, Acceptance, Curiosity, Empathy) and Emotion Coaching provide effective frameworks for supporting children emotionally during conflict.',
    url: 'https://bristolearlyyears.org.uk/personal-social-and-emotional-development/',
    icon: 'heart' as const,
    color: '#F48FB1',
  },
];

const COMPARISONS = [
  {
    name: 'Twinkl',
    price: '£5.99/mo',
    strength: 'Huge resource library',
    gap: 'Generic, not story-led or SEN-focused',
  },
  {
    name: 'TES Resources',
    price: 'Varies',
    strength: 'Teacher-created variety',
    gap: 'Inconsistent quality, no structured programme',
  },
  {
    name: 'Tapestry',
    price: '£21/mo+',
    strength: 'Observation tracking',
    gap: 'Assessment only, no teaching resources',
  },
  {
    name: 'ClassDojo',
    price: 'Free/£7.99',
    strength: 'Behaviour management',
    gap: 'Not curriculum-aligned, US-focused',
  },
];

const IMPROVEMENTS = [
  {
    title: 'Emotion Coaching Integration',
    description: 'Add the 5-step Emotion Coaching framework (Gottman) to every lesson: recognise, connect, listen, name emotions, set limits.',
    priority: 'High',
    icon: 'chatbubble-ellipses',
    color: '#F48FB1',
  },
  {
    title: 'PACE Model Prompts',
    description: 'Embed Dan Hughes\' PACE model (Playfulness, Acceptance, Curiosity, Empathy) prompts into teacher scripts and SEN adaptations.',
    priority: 'High',
    icon: 'people-circle',
    color: '#B39DDB',
  },
  {
    title: 'Post-COVID Self-Regulation Focus',
    description: 'Add dedicated self-regulation activities addressing post-pandemic challenges: separation anxiety, social withdrawal, emotional dysregulation.',
    priority: 'High',
    icon: 'shield-checkmark',
    color: '#4FC3F7',
  },
  {
    title: 'Structured 6-Week Programme',
    description: 'Expand from 4 lessons to a structured 6-week programme (like Partnership for Children model) with weekly themes and progression.',
    priority: 'Medium',
    icon: 'calendar',
    color: '#FFB74D',
  },
  {
    title: 'Parent/Carer Home Activities',
    description: 'Add take-home activity sheets for each lesson so learning extends beyond the classroom (EEF recommends home-school links).',
    priority: 'Medium',
    icon: 'home',
    color: '#81C784',
  },
  {
    title: 'Zones of Regulation Alignment',
    description: 'Map emotions and activities to the Zones of Regulation framework, widely used in UK schools for self-regulation.',
    priority: 'Medium',
    icon: 'color-palette',
    color: '#CE93D8',
  },
];

export default function EvidenceBanner() {
  const [expanded, setExpanded] = useState(false);
  const [showComparisons, setShowComparisons] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.evidenceIcon}>
            <Ionicons name="flask" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Evidence-Based Approach</Text>
            <Text style={styles.headerSubtitle}>
              Aligned with EEF, Development Matters 2025 & UK research
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.mediumGray}
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.expandedContent}>
          {/* Research Evidence */}
          <Text style={styles.sectionTitle}>Research Evidence</Text>
          {EVIDENCE_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.evidenceCard}
              onPress={() => Linking.openURL(item.url).catch(() => {})}
              activeOpacity={0.7}
            >
              <View style={[styles.evidenceCardIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.evidenceCardContent}>
                <Text style={styles.evidenceSource}>{item.source}</Text>
                <Text style={styles.evidenceFinding}>{item.finding}</Text>
                <View style={styles.linkRow}>
                  <Ionicons name="open-outline" size={12} color={COLORS.primary} />
                  <Text style={styles.linkText}>View source</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Competitor Comparison */}
          <TouchableOpacity
            style={styles.toggleSection}
            onPress={() => setShowComparisons(!showComparisons)}
            activeOpacity={0.7}
          >
            <Ionicons name="git-compare" size={18} color={COLORS.primary} />
            <Text style={styles.toggleTitle}>How We Compare to Other UK Resources</Text>
            <Ionicons
              name={showComparisons ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.mediumGray}
            />
          </TouchableOpacity>

          {showComparisons ? (
            <View style={styles.comparisonSection}>
              {COMPARISONS.map((comp, i) => (
                <View key={i} style={styles.compCard}>
                  <View style={styles.compHeader}>
                    <Text style={styles.compName}>{comp.name}</Text>
                    <Text style={styles.compPrice}>{comp.price}</Text>
                  </View>
                  <View style={styles.compRow}>
                    <Ionicons name="add-circle" size={14} color={COLORS.secondary} />
                    <Text style={styles.compText}>{comp.strength}</Text>
                  </View>
                  <View style={styles.compRow}>
                    <Ionicons name="remove-circle" size={14} color={COLORS.accentOrange} />
                    <Text style={styles.compText}>{comp.gap}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.ourAdvantage}>
                <Ionicons name="flower" size={18} color={COLORS.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.advantageTitle}>Many Petals Advantage</Text>
                  <Text style={styles.advantageText}>
                    Story-led, SEN-first, structured programme with integrated assessment 
                    tracking. The only UK resource combining emotional literacy teaching 
                    with built-in pupil progress monitoring against EYFS/KS1 milestones.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Improvement Recommendations */}
          <TouchableOpacity
            style={styles.toggleSection}
            onPress={() => setShowImprovements(!showImprovements)}
            activeOpacity={0.7}
          >
            <Ionicons name="rocket" size={18} color={COLORS.accentOrange} />
            <Text style={styles.toggleTitle}>Evidence-Based Improvement Ideas</Text>
            <Ionicons
              name={showImprovements ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.mediumGray}
            />
          </TouchableOpacity>

          {showImprovements ? (
            <View style={styles.improvementSection}>
              {IMPROVEMENTS.map((item, i) => (
                <View key={i} style={styles.improvementCard}>
                  <View style={styles.improvementHeader}>
                    <View style={[styles.improvementIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as any} size={16} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.improvementTitle}>{item.title}</Text>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: item.priority === 'High' ? '#FFEBEE' : COLORS.bgWarm },
                      ]}>
                        <Text style={[
                          styles.priorityText,
                          { color: item.priority === 'High' ? COLORS.error : COLORS.accentOrange },
                        ]}>
                          {item.priority} Priority
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.improvementDesc}>{item.description}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  evidenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  expandedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  evidenceCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  evidenceCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceCardContent: {
    flex: 1,
  },
  evidenceSource: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  evidenceFinding: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  linkText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: SPACING.md,
  },
  toggleTitle: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  comparisonSection: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  compCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  compHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  compPrice: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  compText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    flex: 1,
  },
  ourAdvantage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.bgGreen,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  advantageTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  advantageText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    lineHeight: 18,
  },
  improvementSection: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  improvementCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 8,
  },
  improvementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  improvementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
    marginTop: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  improvementDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});
