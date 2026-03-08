import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { ACTIVITIES } from '../data/activities';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';
import DifferentiationWizard from '../components/DifferentiationWizard';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { senMode } = useSEN();
  const { toggleFavourite, isFavourite } = useAuth();
  const [showSEN, setShowSEN] = useState(senMode);
  const [showDiffWizard, setShowDiffWizard] = useState(false);

  const activity = ACTIVITIES.find((a) => a.id === id);

  if (!activity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Activity not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const favourited = isFavourite('activity', activity.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Activity {activity.number}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => toggleFavourite('activity', activity.id)}
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={favourited ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={favourited ? COLORS.accent : COLORS.mediumGray}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, showSEN && styles.senToggleActive]}
            onPress={() => setShowSEN(!showSEN)}
            activeOpacity={0.7}
          >
            <Ionicons name="accessibility" size={20} color={showSEN ? COLORS.white : COLORS.purple} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <View style={[styles.titleCard, { backgroundColor: activity.color + '15' }]}>
          <View style={[styles.iconCircle, { backgroundColor: activity.color + '30' }]}>
            <Ionicons name={activity.icon as any} size={36} color={activity.color} />
          </View>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityType}>{activity.type}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{activity.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{activity.ageRange}</Text>
            </View>
            <View style={[styles.skillBadge, { backgroundColor: activity.color + '25' }]}>
              <Text style={[styles.skillText, { color: activity.color }]}>{activity.skillType}</Text>
            </View>
          </View>
        </View>

        {/* Differentiation Wizard Button */}
        <TouchableOpacity
          style={styles.diffWizardBtn}
          onPress={() => setShowDiffWizard(true)}
          activeOpacity={0.7}
        >
          <View style={styles.diffWizardIcon}>
            <Ionicons name="sparkles" size={20} color={COLORS.purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.diffWizardTitle}>Differentiation Wizard</Text>
            <Text style={styles.diffWizardSub}>AI-powered SEN adaptations for this activity</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.purple} />
        </TouchableOpacity>

        {/* Purpose */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Purpose</Text>
          </View>
          <Text style={[styles.sectionText, senMode && styles.senText]}>{activity.purpose}</Text>
        </View>

        {/* Linked To */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Linked to Story</Text>
          </View>
          <Text style={styles.sectionText}>{activity.linkedTo}</Text>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={18} color={COLORS.accentOrange} />
            <Text style={styles.sectionTitle}>Materials</Text>
          </View>
          {activity.materials.map((mat, i) => (
            <MaterialCheck key={i} label={mat} />
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {activity.instructions.map((inst, i) => (
            <View key={i} style={styles.instructionItem}>
              <View style={[styles.stepNumber, { backgroundColor: activity.color }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, senMode && styles.senText]}>{inst}</Text>
            </View>
          ))}
        </View>

        {/* SEN Adaptations */}
        {showSEN && (
          <View style={[styles.section, styles.senSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="accessibility" size={18} color={COLORS.purple} />
              <Text style={[styles.sectionTitle, { color: COLORS.purple }]}>SEN Adaptations</Text>
            </View>
            {activity.senAdaptations.map((item, i) => (
              <View key={i} style={styles.senItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.purple} />
                <Text style={styles.senItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Assessment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="clipboard" size={18} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Assessment Opportunities</Text>
          </View>
          {activity.assessment.map((item, i) => (
            <View key={i} style={styles.assessItem}>
              <Ionicons name="help-circle-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.assessText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Differentiation Wizard Modal */}
      <DifferentiationWizard
        visible={showDiffWizard}
        onClose={() => setShowDiffWizard(false)}
        resourceType="activity"
        title={activity.title}
        description={activity.purpose}
        instructions={activity.instructions.join('\n')}
        materials={activity.materials.join(', ')}
        existingAdaptations={activity.senAdaptations.join(', ')}
      />
    </SafeAreaView>
  );
}

function MaterialCheck({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <TouchableOpacity style={styles.materialItem} onPress={() => setChecked(!checked)} activeOpacity={0.7}>
      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={checked ? COLORS.secondary : COLORS.mediumGray} />
      <Text style={[styles.materialText, checked && styles.materialTextChecked]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  errorText: { fontSize: FONT_SIZES.lg, color: COLORS.textLight },
  backBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.round },
  backBtnText: { color: COLORS.white, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerRight: { flexDirection: 'row', gap: SPACING.xs },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  senToggleActive: { backgroundColor: COLORS.purple },
  content: { flex: 1, padding: SPACING.lg },
  titleCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  activityTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  activityType: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  skillBadge: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.round },
  skillText: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'capitalize' },
  // Differentiation Wizard Button
  diffWizardBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.bgPurple, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1.5, borderColor: COLORS.purple + '30' },
  diffWizardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.purple + '20', justifyContent: 'center', alignItems: 'center' },
  diffWizardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.purple },
  diffWizardSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  section: { marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, lineHeight: 24 },
  senText: { fontSize: FONT_SIZES.lg, lineHeight: 28 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.lg, ...SHADOWS.small },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  instructionText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
  materialItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: SPACING.xs },
  materialText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  materialTextChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  senSection: { backgroundColor: COLORS.bgPurple, padding: SPACING.lg, borderRadius: RADIUS.lg },
  senItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  senItemText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  assessItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  assessText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
});
