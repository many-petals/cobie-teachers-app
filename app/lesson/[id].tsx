import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { LESSONS, LessonMaterial } from '../data/lessons';
import { PRINTABLES } from '../data/printables';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DifferentiationWizard from '../components/DifferentiationWizard';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { senMode } = useSEN();
 const { user, loading, hasFullAccess, billingLoading, billingError, refreshBilling, markLessonComplete, isLessonCompleted, toggleFavourite, isFavourite } = useAuth();
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
        {loading || billingLoading ? (
          <>
            <ActivityIndicator accessibilityLabel="Checking lesson access" />
            <Text style={styles.errorText}>Checking your access…</Text>
          </>
        ) : (
          <>
            <Ionicons name="lock-closed" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{billingError || 'This content is included in Full Access.'}</Text>
            <Text style={styles.errorText}>Your Free Preview includes Lesson 1 and the Free Resource Library.</Text>
            {user && billingError ? (
              <TouchableOpacity accessibilityRole="button" onPress={() => void refreshBilling()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Check access again</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/upgrade')} style={styles.backButton}>
              <Text style={styles.backButtonText}>View access and billing</Text>
            </TouchableOpacity>
          </>
        )}
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

  const handlePrintLesson = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Print blocked', 'Please allow pop-ups, then tap Print lesson again.', 'error');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildLessonPrintHtml(lesson));
    printWindow.document.close();
    // The document also has a visible print button if a mobile browser blocks
    // the automatic dialog. Opening the tab happens directly in the tap handler.
    printWindow.setTimeout(() => printWindow.print(), 400);
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
            onPress={() => router.push('/lessons')}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={[styles.overviewHeader, { backgroundColor: lesson.color + '15' }]}>
          <View style={styles.overviewHeaderText}>
            <Text style={styles.overviewKicker}>LESSON {lesson.number} · {lesson.ageRange}</Text>
            <Text style={styles.overviewTitle}>{lesson.title}</Text>
            <Text style={styles.overviewSubtitle}>{lesson.theme}</Text>
            <Text style={styles.overviewDuration}>Flexible guide: {lesson.duration}. Follow the children’s pace; there is no countdown.</Text>
          </View>
          <TouchableOpacity style={styles.printLessonButton} onPress={handlePrintLesson} activeOpacity={0.7}>
            <Ionicons name="print-outline" size={17} color={COLORS.primary} />
            <Text style={styles.printLessonButtonText}>Print lesson</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionLabel}>Aims and objectives</Text>
          {lesson.objectives.map((objective, i) => (
            <View key={i} style={styles.overviewBullet}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
              <Text style={styles.overviewBulletText}>{objective}</Text>
            </View>
          ))}
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionLabel}>Story connection</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>{lesson.steps[0]?.instruction}</Text>
          </View>
          <Text style={styles.storyReferenceNote}>Use the matching Cobie book page or spread when reading this story moment. Page references are kept with verified story evidence rather than guessed.</Text>
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionLabel}>Materials needed</Text>
          {lesson.materialsDetailed.map((material, i) => (
            <View key={i} style={styles.overviewBullet}>
              <Ionicons name="ellipse" size={8} color={COLORS.accentOrange} />
              <Text style={styles.overviewBulletText}>{material.label}{material.printableId ? ' ' : ''}
                {material.printableId ? <Text accessibilityRole="link" onPress={() => router.push({ pathname: '/printables', params: { printableId: material.printableId } } as any)}>— Open printable</Text> : null}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.sectionLabel}>Expected outcomes</Text>
          {lesson.assessmentOpportunities.map((outcome, i) => (
            <View key={i} style={styles.overviewBullet}>
              <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
              <Text style={styles.overviewBulletText}>{outcome}</Text>
            </View>
          ))}
        </View>

        {/* Step Title */}
        <View style={[styles.stepHeader, { backgroundColor: lesson.color + '15' }]}>
          <View style={[styles.stepNumberBadge, { backgroundColor: lesson.color }]}>
            <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>

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
                    router.push({ pathname: '/printables', params: { printableId } } as any);
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

function buildLessonPrintHtml(lesson: NonNullable<typeof LESSONS[number]>): string {
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] || character);
  const paragraph = (value: string) => `<p>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`;
  const bullets = (items: string[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const section = (title: string, body: string) => `<section><h2>${title}</h2>${body}</section>`;
  const steps = lesson.steps.map((step, index) => `
    <div class="step">
      <h3>${index + 1}. ${escapeHtml(step.title)}</h3>
      ${paragraph(step.instruction)}
      ${step.tips?.length ? `<div class="tips"><strong>Teaching tips</strong>${bullets(step.tips)}</div>` : ''}
    </div>`).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lesson ${lesson.number}: ${escapeHtml(lesson.title)} — Many Petals Learning</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { color: #20354b; background: #f1f3f4; font: 11pt/1.4 Arial, Helvetica, sans-serif; }
  main { width: 100%; max-width: 210mm; margin: 24px auto; padding: 16mm; background: white; }
  .controls { max-width: 210mm; margin: 18px auto 0; text-align: right; }
  button { border: 0; border-radius: 8px; background: #166b86; color: white; font: bold 15px Arial, sans-serif; padding: 12px 18px; cursor: pointer; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; padding-bottom: 7mm; border-bottom: 2px solid #166b86; }
  header strong { color: #166b86; font-size: 10pt; letter-spacing: .08em; }
  header span { color: #526270; font-size: 9pt; }
  .kicker { color: #166b86; font-weight: bold; font-size: 9pt; letter-spacing: .06em; margin: 7mm 0 2mm; }
  h1 { font-size: 21pt; line-height: 1.16; margin: 0 0 3mm; }
  h2 { color: #166b86; font-size: 11pt; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 3mm; }
  h3 { font-size: 13pt; margin: 0 0 2mm; }
  p { margin: 0 0 3mm; }
  .theme { font-size: 11pt; }
  .duration, .note { color: #51616d; font-size: 9.5pt; }
  section { margin-top: 7mm; padding-bottom: 4mm; border-bottom: 1px solid #d7e0e4; }
  ul { margin: 0; padding-left: 6mm; }
  li { margin: 0 0 2mm; }
  .page-break { break-before: page; page-break-before: always; }
  .step { border-left: 3px solid #77b98b; padding-left: 5mm; margin: 0 0 6mm; break-inside: avoid; page-break-inside: avoid; }
  .tips { background: #f3f7ed; padding: 3mm 4mm; margin-top: 2mm; font-size: 10pt; }
  .tips ul { margin-top: 2mm; }
  footer { margin-top: 8mm; padding-top: 3mm; border-top: 1px solid #d7e0e4; color: #526270; font-size: 8pt; }
  @media print { body { background: white; } main { max-width: none; margin: 0; padding: 0; } .controls { display: none; } }
</style></head><body>
<div class="controls"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>
<main>
  <header><strong>MANY PETALS LEARNING</strong><span>Cobie Teacher Pack</span></header>
  <p class="kicker">LESSON ${lesson.number} · ${escapeHtml(lesson.ageRange)}</p>
  <h1>${escapeHtml(lesson.title)}</h1>
  <p class="theme">${escapeHtml(lesson.theme)}</p>
  <p class="duration">Flexible guide: ${escapeHtml(lesson.duration)}. Follow the children’s pace; there is no countdown.</p>
  ${section('Aims and objectives', bullets(lesson.objectives))}
  ${section('Story connection', paragraph(lesson.steps[0]?.instruction || '') + '<p class="note">Use the matching Cobie book page or spread when reading this story moment. Page references are kept with verified story evidence rather than guessed.</p>')}
  ${section('Materials needed', bullets(lesson.materialsDetailed.map((material) => `${material.label}${material.printableId ? ' (classroom printable)' : ''}`)))}
  ${section('Expected outcomes', bullets(lesson.assessmentOpportunities))}
  <div class="page-break"></div>
  ${section('Lesson steps', steps)}
  ${section('SEN adaptations', bullets(lesson.senDifferentiation))}
  <footer>© 2026 Many Petals Learning. Classroom and educational use only. Not for resale or redistribution.</footer>
</main></body></html>`;
}

function MaterialCheckItem({ material, onPrintResource }: {
  material: LessonMaterial;
  onPrintResource: (id: string) => void;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <View style={styles.materialItem}>
      <TouchableOpacity
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={material.label}
        onPress={() => setChecked(!checked)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
      >
        <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={checked ? COLORS.secondary : COLORS.mediumGray} />
        <Text style={styles.materialText}>{material.label}</Text>
      </TouchableOpacity>
      {material.printableId ? (
        <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Open ${material.label} printable`} onPress={() => onPrintResource(material.printableId!)}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Printable</Text>
        </TouchableOpacity>
      ) : null}
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
  overviewHeader: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg },
  overviewHeaderText: { marginBottom: SPACING.md },
  overviewKicker: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.7, marginBottom: SPACING.xs },
  overviewTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 28 },
  overviewSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: SPACING.xs },
  overviewDuration: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, lineHeight: 18, marginTop: SPACING.sm },
  printLessonButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary + '35', borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  printLessonButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  overviewSection: { marginBottom: SPACING.lg },
  overviewBullet: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  overviewBulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  storyReferenceNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, lineHeight: 18, marginTop: SPACING.sm, fontStyle: 'italic' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.lg },
  stepNumberBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  stepTitle: { flex: 1, fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
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
