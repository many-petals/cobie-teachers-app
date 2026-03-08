import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { LESSONS, LessonMaterial } from '../data/lessons';
import { PRINTABLES } from '../data/printables';
import Timer from '../components/Timer';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DifferentiationWizard from '../components/DifferentiationWizard';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { senMode } = useSEN();
 const { hasFullAccess, markLessonComplete, isLessonCompleted, toggleFavourite, isFavourite } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSEN, setShowSEN] = useState(senMode);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [lessonDone, setLessonDone] = useState(false);
  const [showDiffWizard, setShowDiffWizard] = useState(false);


  const lesson = LESSONS.find((l) => l.id === id);
  const isLocked = lesson && lesson.access !== 'free' && !hasFullAccess;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
if (isLocked) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>This content is included in Full Access.</Text>
        <Text style={styles.errorText}>Your Free Preview includes Lesson 1 and the Free Resource Library.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Free Preview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
  const step = lesson.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === lesson.steps.length - 1;
  const alreadyCompleted = isLessonCompleted(lesson.id);
  const favourited = isFavourite('lesson', lesson.id);

  const markStepComplete = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
  };

  const goNext = () => {
    markStepComplete();
    if (!isLast) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  const handleCompleteLesson = async () => {
    markStepComplete();
    await markLessonComplete(lesson.id);
    showToast(
      'Lesson Complete!',
      `Well done! Lesson ${lesson.number} has been marked as complete.`,
      'success'
    );
    setLessonDone(true);
  };

  // If lesson is done, show completion screen
  if (lessonDone) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completionScreen}>
          <View style={[styles.completionIcon, { backgroundColor: lesson.color + '20' }]}>
            <Ionicons name="checkmark-circle" size={64} color={lesson.color} />
          </View>
          <Text style={styles.completionTitle}>Lesson {lesson.number} Complete!</Text>
          <Text style={styles.completionSubtitle}>{lesson.title}</Text>
          <Text style={styles.completionText}>
            All steps have been covered. Well done!
          </Text>
          <TouchableOpacity
            style={[styles.completionButton, { backgroundColor: lesson.color }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            <Text style={styles.completionButtonText}>Back to Lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = ((currentStep + 1) / lesson.steps.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.lessonLabel}>Lesson {lesson.number}</Text>
          <Text style={styles.stepLabel} numberOfLines={1}>
            Step {currentStep + 1} of {lesson.steps.length}
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={() => toggleFavourite('lesson', lesson.id)}
            style={styles.topBarBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={favourited ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={favourited ? COLORS.accent : COLORS.mediumGray}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.topBarBtn, showSEN && styles.senToggleActive]}
            onPress={() => setShowSEN(!showSEN)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="accessibility"
              size={20}
              color={showSEN ? COLORS.white : COLORS.purple}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.round(progress)}%` as any, backgroundColor: lesson.color }]} />
      </View>

      {/* Step Dots */}
      <View style={styles.stepDots}>
        {lesson.steps.map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dot,
              i === currentStep && { backgroundColor: lesson.color, transform: [{ scale: 1.3 }] },
              completedSteps.has(i) && i !== currentStep && { backgroundColor: COLORS.secondary },
            ]}
            onPress={() => setCurrentStep(i)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Title */}
        <View style={[styles.stepHeader, { backgroundColor: lesson.color + '15' }]}>
          <View style={[styles.stepNumberBadge, { backgroundColor: lesson.color }]}>
            <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>

        {/* Timer */}
        {step.duration ? (
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>Activity Timer ({step.duration} min)</Text>
            <Timer initialMinutes={step.duration} />
          </View>
        ) : null}

        {/* Instructions */}
        <View style={styles.instructionSection}>
          <Text style={styles.sectionLabel}>Instructions</Text>
          <View style={styles.instructionCard}>
            <Text style={[styles.instructionText, senMode && styles.senInstructionText]}>
              {step.instruction}
            </Text>
          </View>
        </View>

        {/* Tips */}
        {step.tips && step.tips.length > 0 ? (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionLabel}>Teaching Tips</Text>
            {step.tips.map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Ionicons name="bulb" size={16} color={COLORS.accent} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* SEN Adaptations */}
        {showSEN ? (
          <View style={styles.senSection}>
            <View style={styles.senHeader}>
              <Ionicons name="accessibility" size={18} color={COLORS.purple} />
              <Text style={styles.senTitle}>SEN Adaptations</Text>
            </View>
            {lesson.senDifferentiation.map((item, i) => (
              <View key={i} style={styles.senItem}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.purple} />
                <Text style={styles.senText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Materials Checklist - Enhanced with printable linking */}
        {currentStep === 0 ? (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionLabel}>Materials Checklist</Text>
            <Text style={styles.materialsHint}>
              Tick items you have, or tap "Print Resource" for in-app printables
            </Text>
            {lesson.materialsDetailed.map((mat, i) => (
              <MaterialCheckItem
                key={i}
                material={mat}
                onPrintResource={(printableId) => {
                  router.back();
                  setTimeout(() => {
                    router.push('/printables' as any);
                  }, 300);
                }}
              />
            ))}
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirst && styles.navButtonDisabled]}
          onPress={goPrev}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={isFirst ? COLORS.mediumGray : COLORS.primary} />
          <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.navButton, styles.completeButton]}
            onPress={handleCompleteLesson}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            <Text style={styles.completeButtonText}>
              {alreadyCompleted ? 'Finish' : 'Complete Lesson'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, { backgroundColor: lesson.color }]}
            onPress={goNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>Next Step</Text>
            <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function MaterialCheckItem({ material, onPrintResource }: {
  material: LessonMaterial;
  onPrintResource: (id: string) => void;
}) {
  const [status, setStatus] = useState<'unchecked' | 'have-it' | 'printing'>('unchecked');
  const { showToast } = useToast();
  const hasPrintable = !!material.printableId;
  const printable = hasPrintable ? PRINTABLES.find(p => p.id === material.printableId) : null;

  const handleHaveIt = () => {
    setStatus(status === 'have-it' ? 'unchecked' : 'have-it');
  };

  const handlePrintResource = () => {
    if (!material.printableId) return;
    setStatus('printing');
    showToast(
      'Opening Printables',
      `Navigating to "${material.printableLabel}" in Printables section.`,
      'info'
    );
    onPrintResource(material.printableId);
  };

  if (!hasPrintable) {
    // Simple checkbox for non-printable materials
    return (
      <TouchableOpacity
        style={styles.materialItem}
        onPress={() => setStatus(status === 'have-it' ? 'unchecked' : 'have-it')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={status === 'have-it' ? 'checkbox' : 'square-outline'}
          size={22}
          color={status === 'have-it' ? COLORS.secondary : COLORS.mediumGray}
        />
        <Text style={[styles.materialText, status === 'have-it' && styles.materialTextChecked]}>
          {material.label}
        </Text>
      </TouchableOpacity>
    );
  }

  // Enhanced material item with printable link
  return (
    <View style={styles.materialItemEnhanced}>
      <View style={styles.materialTopRow}>
        <View style={[styles.printableBadge, { backgroundColor: printable?.color ? printable.color + '15' : COLORS.bgLight }]}>
          <Ionicons name={printable?.icon as any || 'document'} size={16} color={printable?.color || COLORS.primary} />
        </View>
        <View style={styles.materialLabelWrap}>
          <Text style={[styles.materialText, status !== 'unchecked' && styles.materialTextChecked]}>
            {material.label}
          </Text>
          <Text style={styles.materialPrintableNote}>
            Available in app as printable resource
          </Text>
        </View>
      </View>
      <View style={styles.materialActions}>
        <TouchableOpacity
          style={[
            styles.materialActionBtn,
            status === 'have-it' && styles.materialActionBtnActive,
          ]}
          onPress={handleHaveIt}
          activeOpacity={0.7}
        >
          <Ionicons
            name={status === 'have-it' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={16}
            color={status === 'have-it' ? COLORS.white : COLORS.secondary}
          />
          <Text style={[
            styles.materialActionText,
            status === 'have-it' && styles.materialActionTextActive,
          ]}>
            Already have it
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.materialActionBtn, styles.materialPrintBtn]}
          onPress={handlePrintResource}
          activeOpacity={0.7}
        >
          <Ionicons name="print-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.materialActionText, { color: COLORS.primary }]}>
            Print Resource
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  errorText: { fontSize: FONT_SIZES.lg, color: COLORS.textLight },
  backButton: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.round },
  backButtonText: { color: COLORS.white, fontWeight: '600' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarRight: { flexDirection: 'row', gap: SPACING.xs },
  topBarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  lessonLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  senToggleActive: { backgroundColor: COLORS.purple },
  progressContainer: { height: 4, backgroundColor: COLORS.lightGray },
  progressBar: { height: 4, borderRadius: 2 },
  stepDots: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: COLORS.white },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.lightGray },
  content: { flex: 1, padding: SPACING.lg },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.lg },
  stepNumberBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  stepTitle: { flex: 1, fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  timerSection: { marginBottom: SPACING.lg },
  timerLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.sm },
  instructionSection: { marginBottom: SPACING.lg },
  sectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  instructionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.small },
  instructionText: { fontSize: FONT_SIZES.lg, color: COLORS.text, lineHeight: 28 },
  senInstructionText: { fontSize: FONT_SIZES.xl, lineHeight: 32 },
  tipsSection: { marginBottom: SPACING.lg },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm, backgroundColor: COLORS.bgWarm, padding: SPACING.md, borderRadius: RADIUS.md },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  senSection: { backgroundColor: COLORS.bgPurple, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg },
  senHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  senTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.purple },
  senItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  senText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  materialsSection: { marginBottom: SPACING.lg },
  materialsHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.md, fontStyle: 'italic' },
  materialItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: SPACING.xs },
  materialText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  materialTextChecked: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  // Enhanced material item with printable link
  materialItemEnhanced: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    ...SHADOWS.small,
  },
  materialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  printableBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialLabelWrap: {
    flex: 1,
  },
  materialPrintableNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  materialActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  materialActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgGreen,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  materialActionBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  materialPrintBtn: {
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.primary + '30',
  },
  materialActionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  materialActionTextActive: {
    color: COLORS.white,
  },
  bottomNav: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.lightGray, gap: SPACING.md },
  navButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.lg, minHeight: 52 },
  navButtonDisabled: { opacity: 0.5 },
  prevButton: { backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.lightGray },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.primary },
  navButtonTextDisabled: { color: COLORS.mediumGray },
  nextButton: { flex: 1, ...SHADOWS.medium },
  nextButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  completeButton: { flex: 1, backgroundColor: COLORS.secondary, ...SHADOWS.medium },
  completeButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  // Completion screen styles
  completionScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  completionIcon: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  completionTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  completionSubtitle: { fontSize: FONT_SIZES.lg, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm },
  completionText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
  completionButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.xxl, ...SHADOWS.medium },
  completionButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
});
