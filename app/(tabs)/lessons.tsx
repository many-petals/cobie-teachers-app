import React, { useMemo, useState } from 'react';
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
import { LESSONS, type Lesson } from '../data/lessons';
import { PRINTABLES } from '../data/printables';
import AppSignOutButton from '../components/AppSignOutButton';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';

function getLessonAvailability(lesson: Lesson, hasFullAccess: boolean) {
  const locked = lesson.access === 'paid' && !hasFullAccess;
  const accessLabel =
    lesson.access === 'free' ? 'Free' : lesson.access === 'preview' ? 'Preview' : 'Premium';

  return { locked, accessLabel };
}

export default function LessonsScreen() {
  const router = useRouter();
  const { senMode } = useSEN();
  const { toggleFavourite, isFavourite, isLessonCompleted, hasFullAccess } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const lessonStats = useMemo(() => {
    const completedCount = LESSONS.filter((lesson) => isLessonCompleted(lesson.id)).length;
    const availableCount = LESSONS.filter((lesson) => !getLessonAvailability(lesson, hasFullAccess).locked).length;
    const lockedCount = LESSONS.length - availableCount;
    const nextLessonId =
      LESSONS.find((lesson) => !getLessonAvailability(lesson, hasFullAccess).locked && !isLessonCompleted(lesson.id))?.id ?? null;

    return {
      completedCount,
      availableCount,
      lockedCount,
      nextLessonId,
    };
  }, [hasFullAccess, isLessonCompleted]);

  const handleCardPress = (lesson: Lesson, locked: boolean, isExpanded: boolean) => {
    if (locked) {
      router.push('/upgrade');
      return;
    }

    setExpandedId(isExpanded ? null : lesson.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="book" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Core Lessons</Text>
        </View>
        <AppSignOutButton />
      </View>

      <Text style={styles.intro}>
        Teach in a simple flow: choose a lesson, follow the steps, then open the matching resources.
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{lessonStats.availableCount}</Text>
          <Text style={styles.summaryLabel}>Available Now</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{lessonStats.completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{lessonStats.lockedCount}</Text>
          <Text style={styles.summaryLabel}>Locked</Text>
        </View>
      </View>

      {!hasFullAccess ? (
        <View style={styles.upgradeBanner}>
          <View style={styles.upgradeCopy}>
            <Text style={styles.upgradeTitle}>Unlock the full lesson journey</Text>
            <Text style={styles.upgradeText}>
              Premium lessons include the full step flow, SEN support, and linked printable resources.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/upgrade')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>Start 14-Day Trial</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {LESSONS.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          const completed = isLessonCompleted(lesson.id);
          const favourited = isFavourite('lesson', lesson.id);
          const linkedPrintables = lesson.materialsDetailed.filter((material) => material.printableId);
          const { locked, accessLabel } = getLessonAvailability(lesson, hasFullAccess);
          const isRecommended = !completed && !locked && lessonStats.nextLessonId === lesson.id;

          return (
            <View key={lesson.id} style={styles.lessonCard}>
              <TouchableOpacity
                style={[styles.lessonHeader, { borderLeftColor: locked ? COLORS.mediumGray : lesson.color }]}
                onPress={() => handleCardPress(lesson, locked, isExpanded)}
                activeOpacity={0.8}
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
                  <View style={styles.lessonTopRow}>
                    <Text style={styles.lessonKicker}>Lesson {lesson.number}</Text>
                    <View style={styles.lessonChips}>
                      <View
                        style={[
                          styles.statusChip,
                          completed
                            ? styles.statusChipDone
                            : locked
                            ? styles.statusChipLocked
                            : isRecommended
                            ? styles.statusChipNext
                            : styles.statusChipReady,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            completed
                              ? styles.statusChipTextDone
                              : locked
                              ? styles.statusChipTextLocked
                              : isRecommended
                              ? styles.statusChipTextNext
                              : styles.statusChipTextReady,
                          ]}
                        >
                          {completed ? 'Completed' : locked ? 'Locked' : isRecommended ? 'Start Here' : 'Ready'}
                        </Text>
                      </View>
                      <View style={styles.accessChip}>
                        <Text style={styles.accessChipText}>{accessLabel}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.titleRow}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.lessonTitle, senMode && styles.senTitle]} numberOfLines={2}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
                    </View>

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
                    <View style={[styles.focusBadge, { backgroundColor: lesson.color + '18' }]}>
                      <Text style={[styles.focusText, { color: lesson.color }]}>{lesson.focus}</Text>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name={locked ? 'chevron-forward' : isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>

              {isExpanded ? (
                <View style={styles.expandedContent}>
                  <Text style={styles.themeText}>{lesson.theme}</Text>

                  <View style={styles.flowSummary}>
                    <View style={styles.flowSummaryCard}>
                      <Text style={styles.flowSummaryNumber}>{lesson.steps.length}</Text>
                      <Text style={styles.flowSummaryLabel}>Steps</Text>
                    </View>
                    <View style={styles.flowSummaryCard}>
                      <Text style={styles.flowSummaryNumber}>{linkedPrintables.length}</Text>
                      <Text style={styles.flowSummaryLabel}>Resources</Text>
                    </View>
                    <View style={styles.flowSummaryCard}>
                      <Text style={styles.flowSummaryNumber}>{lesson.senDifferentiation.length}</Text>
                      <Text style={styles.flowSummaryLabel}>SEN Supports</Text>
                    </View>
                  </View>

                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>What Children Will Learn</Text>
                    {lesson.objectives.map((objective, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                        <Text style={styles.bulletText}>{objective}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>Lesson Flow</Text>
                    {lesson.steps.map((step, index) => (
                      <View key={index} style={styles.stepPreview}>
                        <View style={[styles.stepDot, { backgroundColor: lesson.color }]}>
                          <Text style={styles.stepDotText}>{index + 1}</Text>
                        </View>
                        <View style={styles.stepCopy}>
                          <Text style={styles.stepPreviewText}>{step.title}</Text>
                          <Text style={styles.stepPreviewHint}>
                            {step.duration ? `${step.duration} min` : 'Flexible timing'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>Resources</Text>
                    {lesson.materialsDetailed.map((material, index) => {
                      const printable = material.printableId
                        ? PRINTABLES.find((resource) => resource.id === material.printableId)
                        : null;

                      return (
                        <View
                          key={index}
                          style={[
                            styles.materialRow,
                            material.printableId ? styles.materialRowPrintable : undefined,
                          ]}
                        >
                          <Ionicons
                            name={
                              material.printableId
                                ? (printable?.icon as any) || 'document-text-outline'
                                : 'cube-outline'
                            }
                            size={16}
                            color={material.printableId ? printable?.color || COLORS.primary : COLORS.accentOrange}
                          />
                          <View style={styles.materialContent}>
                            <Text style={styles.bulletText}>{material.label}</Text>
                            {material.printableId ? (
                              <TouchableOpacity
                                style={styles.printLink}
                                onPress={() => router.push('/printables' as any)}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="print-outline" size={12} color={COLORS.primary} />
                                <Text style={styles.printLinkText}>Open in Printables</Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {senMode ? (
                    <View style={[styles.subSection, styles.senSection]}>
                      <Text style={[styles.subTitle, styles.senSectionTitle]}>SEN Differentiation</Text>
                      {lesson.senDifferentiation.map((item, index) => (
                        <View key={index} style={styles.bulletItem}>
                          <Ionicons name="accessibility" size={16} color={COLORS.purple} />
                          <Text style={styles.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: lesson.color }]}
                    onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={completed ? 'refresh' : isRecommended ? 'play-circle' : 'arrow-forward-circle'}
                      size={22}
                      color={COLORS.white}
                    />
                    <Text style={styles.startButtonText}>
                      {completed ? 'Replay Lesson' : isRecommended ? 'Open Lesson' : 'View Lesson'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  intro: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  summaryNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  upgradeBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#FFF7E6',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F4D39A',
  },
  upgradeCopy: {
    marginBottom: SPACING.md,
  },
  upgradeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  upgradeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  container: { flex: 1, paddingHorizontal: SPACING.lg },
  lessonCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 5,
  },
  lessonNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  lessonNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  lessonKicker: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  statusChipDone: { backgroundColor: COLORS.bgGreen },
  statusChipLocked: { backgroundColor: '#F3F4F6' },
  statusChipReady: { backgroundColor: COLORS.bgLight },
  statusChipNext: { backgroundColor: '#E8F5E9' },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  statusChipTextDone: { color: COLORS.secondary },
  statusChipTextLocked: { color: COLORS.mediumGray },
  statusChipTextReady: { color: COLORS.primary },
  statusChipTextNext: { color: '#2E7D32' },
  accessChip: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  accessChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentOrange,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  senTitle: { fontSize: FONT_SIZES.lg },
  lessonSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  favBtn: { padding: 4, marginLeft: SPACING.sm },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  focusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  focusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  expandedContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  themeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.md,
  },
  flowSummary: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  flowSummaryCard: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  flowSummaryNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  flowSummaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  subSection: { marginTop: SPACING.lg },
  subTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  stepPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepDotText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepCopy: { flex: 1 },
  stepPreviewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  stepPreviewHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
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
  materialContent: { flex: 1 },
  printLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  printLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  senSection: {
    backgroundColor: COLORS.bgPurple,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  senSectionTitle: {
    color: COLORS.purple,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.medium,
  },
  startButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
