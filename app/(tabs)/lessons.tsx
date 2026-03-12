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
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { LESSONS } from '../data/lessons';
import { PRINTABLES } from '../data/printables';
import SENBanner from '../components/SENBanner';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';

export default function LessonsScreen() {
  const router = useRouter();
  const { senMode } = useSEN();
  const { toggleFavourite, isFavourite, isLessonCompleted, hasFullAccess } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="book" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Core Lessons</Text>
      </View>
      <SENBanner />

      <Text style={styles.intro}>
        4 complete lessons designed for immediate classroom use. Each includes step-by-step
        instructions, materials lists, and SEN differentiation.
      </Text>

      {!hasFullAccess && (
  <View style={styles.upgradeBanner}>
    <Text style={styles.upgradeTitle}>Unlock all 4 emotional literacy lessons</Text>
    <Text style={styles.upgradeText}>✔ Full lesson plans{"\n"}✔ Differentiation ideas{"\n"}✔ Printable worksheets</Text>
    <TouchableOpacity
      style={styles.upgradeButton}
      onPress={() => router.push('/guide')}
    >
      <Text style={styles.upgradeButtonText}>Start 14-Day Trial</Text>
    </TouchableOpacity>
  </View>
)}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {LESSONS.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          const completed = isLessonCompleted(lesson.id);
          const locked = !hasFullAccess && lesson.number > 1;
          const favourited = isFavourite('lesson', lesson.id);

          return (
            <View key={lesson.id} style={styles.lessonCard}>
              <TouchableOpacity
                style={[styles.lessonHeader, { borderLeftColor: lesson.color }]}
                onPress={() => {
                  if (locked) {
                    router.push('/upgrade');
                  } else {
                    setExpandedId(isExpanded ? null : lesson.id);
                  }
                }}
                activeOpacity={0.7}
              >
<View style={[styles.lessonNumber, { backgroundColor: locked ? COLORS.mediumGray : lesson.color }]}>
  {locked ? (
    <Ionicons name="lock-closed" size={18} color={COLORS.white} />
  ) : completed ? (
    <Ionicons name="checkmark" size={20} color={COLORS.white} />
  ) : (
    <Text style={styles.lessonNumberText}>{lesson.number}</Text>
  )}
</View>
                <View style={styles.lessonInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.lessonTitle, senMode && styles.senTitle]} numberOfLines={2}>
                      {lesson.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavourite('lesson', lesson.id)}
                      style={styles.favBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={favourited ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={favourited ? COLORS.accent : COLORS.mediumGray}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.lessonMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{lesson.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="school-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{lesson.ageRange}</Text>
                    </View>
                    {completed && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={COLORS.secondary} />
                        <Text style={styles.completedText}>Done</Text>
                      </View>
                    )}
                    <View style={[styles.focusBadge, { backgroundColor: lesson.color + '20' }]}>
                      <Text style={[styles.focusText, { color: lesson.color }]}>
                        {lesson.focus}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.themeText}>{lesson.theme}</Text>

                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>Learning Objectives</Text>
                    {lesson.objectives.map((obj, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>{obj}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Enhanced Materials with Printable Links */}
                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>Materials Needed</Text>
                    {lesson.materialsDetailed.map((mat, i) => {
                      const hasPrintable = !!mat.printableId;
                      const printable = hasPrintable ? PRINTABLES.find(p => p.id === mat.printableId) : null;
                      return (
                        <View key={i} style={[styles.materialRow, hasPrintable && styles.materialRowPrintable]}>
                          <Ionicons
                            name={hasPrintable ? (printable?.icon as any || 'document') : 'cube-outline'}
                            size={16}
                            color={hasPrintable ? (printable?.color || COLORS.primary) : COLORS.accentOrange}
                          />
                          <View style={styles.materialContent}>
                            <Text style={styles.bulletText}>{mat.label}</Text>
                            {hasPrintable ? (
                              <TouchableOpacity
                                style={styles.printLink}
                                onPress={() => router.push('/printables' as any)}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="print-outline" size={12} color={COLORS.primary} />
                                <Text style={styles.printLinkText}>
                                  Available in Printables
                                </Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>
                      Lesson Steps ({lesson.steps.length} steps)
                    </Text>
                    {lesson.steps.map((step, i) => (
                      <View key={i} style={styles.stepPreview}>
                        <View style={[styles.stepDot, { backgroundColor: lesson.color }]}>
                          <Text style={styles.stepDotText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepPreviewText}>{step.title}</Text>
                        {step.duration && (
                          <Text style={styles.stepDuration}>{step.duration} min</Text>
                        )}
                      </View>
                    ))}
                  </View>

                  {senMode && (
                    <View style={[styles.subSection, styles.senSection]}>
                      <Text style={[styles.subTitle, { color: COLORS.purple }]}>
                        SEN Differentiation
                      </Text>
                      {lesson.senDifferentiation.map((item, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Ionicons name="accessibility" size={16} color={COLORS.purple} />
                          <Text style={styles.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: lesson.color }]}
                    onPress={() => {
                      if (locked) {
                        router.push('/upgrade');
                      } else {
                        router.push(`/lesson/${lesson.id}` as any);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={completed ? 'refresh' : 'play-circle'} size={22} color={COLORS.white} />
                    <Text style={styles.startButtonText}>
                      {completed ? 'Replay Lesson' : 'Start Lesson Player'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  intro: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, paddingHorizontal: SPACING.lg, marginTop: SPACING.sm, marginBottom: SPACING.md },
  container: { flex: 1, paddingHorizontal: SPACING.lg },
  lessonCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.small },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderLeftWidth: 5 },
  lessonNumber: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  lessonNumberText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  lessonInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  lessonTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, lineHeight: 22 },
  senTitle: { fontSize: FONT_SIZES.lg },
  favBtn: { padding: 4, marginLeft: SPACING.sm },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xs, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.bgGreen, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.round },
  completedText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.secondary },
  focusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.round },
  focusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  upgradeBanner: {
    backgroundColor: '#FFF7E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6
  },
  
  upgradeText: {
    fontSize: 14,
    marginBottom: 10
  },
  
  upgradeButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  expandedContent: { padding: SPACING.lg, paddingTop: 0, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  themeText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: SPACING.md, fontStyle: 'italic' },
  subSection: { marginTop: SPACING.lg },
  subTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  // Enhanced material rows
  materialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  materialRowPrintable: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary + '40',
  },
  materialContent: {
    flex: 1,
  },
  printLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  printLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  stepPreview: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  stepDot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stepDotText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
  stepPreviewText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  stepDuration: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  senSection: { backgroundColor: COLORS.bgPurple, padding: SPACING.md, borderRadius: RADIUS.lg },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.lg, ...SHADOWS.medium },
  startButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
});
