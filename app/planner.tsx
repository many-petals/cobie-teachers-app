import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from './data/theme';
import { supabase } from './lib/supabase';
import { SavedWeeklyPlan, loadWeeklyPlans, addWeeklyPlan, removeWeeklyPlan } from './lib/storage';

const FOCUS_AREAS = [
  { id: 'emotional', label: 'Emotional Literacy', icon: 'heart', color: '#F48FB1' },
  { id: 'sensory', label: 'Sensory Awareness', icon: 'eye', color: '#FF8A65' },
  { id: 'communication', label: 'Communication', icon: 'chatbubbles', color: '#42A5F5' },
  { id: 'inclusion', label: 'Inclusion & Empathy', icon: 'people', color: '#AB47BC' },
  { id: 'regulation', label: 'Self-Regulation', icon: 'leaf', color: '#66BB6A' },
  { id: 'creative', label: 'Creative Expression', icon: 'color-palette', color: '#FFB74D' },
];

const DAY_COLORS: Record<string, string> = {
  Monday: '#42A5F5',
  Tuesday: '#66BB6A',
  Wednesday: '#FFA726',
  Thursday: '#AB47BC',
  Friday: '#EF5350',
};

export default function PlannerScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'config' | 'loading' | 'plan' | 'saved'>('config');
  const [ageGroup, setAgeGroup] = useState<'EYFS' | 'KS1'>('EYFS');
  const [classSize, setClassSize] = useState('30');
  const [weekNumber, setWeekNumber] = useState('1');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['emotional', 'sensory']);
  const [senNeeds, setSenNeeds] = useState('Mixed abilities, some sensory sensitivities');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [savedPlans, setSavedPlans] = useState<SavedWeeklyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    const plans = await loadWeeklyPlans();
    setSavedPlans(plans);
  };

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const generatePlan = async () => {
    if (selectedFocus.length === 0) {
      Alert.alert('Select Focus', 'Please select at least one focus area.');
      return;
    }

    setStep('loading');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-weekly-plan', {
        body: {
          ageGroup,
          focusAreas: selectedFocus,
          senNeeds,
          weekNumber: parseInt(weekNumber) || 1,
          classSize: parseInt(classSize) || 30,
          additionalNotes,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error && !data?.plan) throw new Error(data.error);

      if (data?.plan) {
        setPlan(data.plan);
        setExpandedDay(data.plan.days?.[0]?.day || null);
        setStep('plan');
      } else if (data?.rawPlan) {
        // Try to display raw plan
        Alert.alert('Plan Generated', 'The plan was generated but could not be fully parsed. Please try again.');
        setStep('config');
      } else {
        throw new Error('No plan data returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
      setStep('config');
    }
  };

  const savePlan = async () => {
    if (!plan) return;
    const saved = await addWeeklyPlan({
      name: plan.weekTitle || `Week ${weekNumber} Plan`,
      ageGroup,
      plan,
    });
    setSavedPlans(prev => [saved, ...prev]);
    Alert.alert('Saved', 'Weekly plan saved to your device.');
  };

  const deleteSavedPlan = async (id: string) => {
    Alert.alert('Delete Plan', 'Remove this saved plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeWeeklyPlan(id);
          setSavedPlans(prev => prev.filter(p => p.id !== id));
        },
      },
    ]);
  };

  const viewSavedPlan = (saved: SavedWeeklyPlan) => {
    setPlan(saved.plan);
    setExpandedDay(saved.plan.days?.[0]?.day || null);
    setStep('plan');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Weekly Planner</Text>
          <Text style={styles.headerSub}>AI-powered lesson planning</Text>
        </View>
        {savedPlans.length > 0 && step !== 'saved' && (
          <TouchableOpacity
            style={styles.savedBtn}
            onPress={() => setStep('saved')}
            activeOpacity={0.7}
          >
            <Ionicons name="folder" size={18} color={COLORS.primary} />
            <Text style={styles.savedBtnText}>{savedPlans.length}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Config Step */}
      {step === 'config' && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.configTitle}>Plan Your Week</Text>
            </View>
            <Text style={styles.configDesc}>
              Configure your class details and the AI will generate a complete weekly plan using Cobie lessons, activities, and printables.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Age Group */}
          <Text style={styles.sectionLabel}>Age Group</Text>
          <View style={styles.toggleRow}>
            {(['EYFS', 'KS1'] as const).map(ag => (
              <TouchableOpacity
                key={ag}
                style={[styles.toggleBtn, ageGroup === ag && styles.toggleBtnActive]}
                onPress={() => setAgeGroup(ag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, ageGroup === ag && styles.toggleTextActive]}>{ag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Week & Class Size */}
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Week Number</Text>
              <TextInput
                style={styles.input}
                value={weekNumber}
                onChangeText={setWeekNumber}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Class Size</Text>
              <TextInput
                style={styles.input}
                value={classSize}
                onChangeText={setClassSize}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Focus Areas */}
          <Text style={styles.sectionLabel}>Focus Areas</Text>
          <View style={styles.focusGrid}>
            {FOCUS_AREAS.map(area => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.focusChip,
                  selectedFocus.includes(area.id) && { backgroundColor: area.color + '20', borderColor: area.color },
                ]}
                onPress={() => toggleFocus(area.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={area.icon as any}
                  size={16}
                  color={selectedFocus.includes(area.id) ? area.color : COLORS.textMuted}
                />
                <Text style={[
                  styles.focusText,
                  selectedFocus.includes(area.id) && { color: area.color, fontWeight: '700' },
                ]}>
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SEN Needs */}
          <Text style={styles.sectionLabel}>SEN Needs in Class</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={senNeeds}
            onChangeText={setSenNeeds}
            placeholder="Describe any SEN needs..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />

          {/* Additional Notes */}
          <Text style={styles.sectionLabel}>Additional Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="e.g. School trip on Wednesday, assembly on Friday..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={2}
          />

          {/* Generate Button */}
          <TouchableOpacity style={styles.generateBtn} onPress={generatePlan} activeOpacity={0.7}>
            <Ionicons name="sparkles" size={22} color={COLORS.white} />
            <Text style={styles.generateBtnText}>Generate Weekly Plan</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Plans are AI-generated suggestions. Always review and adapt based on your professional judgement and individual class needs.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>Generating Your Plan...</Text>
          <Text style={styles.loadingText}>
            Creating a personalised weekly plan for your {ageGroup} class with {selectedFocus.length} focus area{selectedFocus.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.loadingSteps}>
            {['Selecting lessons & activities', 'Scheduling sessions', 'Adding SEN adaptations', 'Preparing materials list'].map((s, i) => (
              <View key={i} style={styles.loadingStep}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <Text style={styles.loadingStepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Plan View */}
      {step === 'plan' && plan && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Plan Header */}
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{plan.weekTitle || 'Weekly Plan'}</Text>
            {plan.weekTheme && <Text style={styles.planTheme}>{plan.weekTheme}</Text>}
            {plan.overview && <Text style={styles.planOverview}>{plan.overview}</Text>}
          </View>

          {/* Action Buttons */}
          <View style={styles.planActions}>
            <TouchableOpacity style={styles.planActionBtn} onPress={savePlan} activeOpacity={0.7}>
              <Ionicons name="download" size={18} color={COLORS.primary} />
              <Text style={styles.planActionText}>Save Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planActionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => { setPlan(null); setStep('config'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={COLORS.white} />
              <Text style={[styles.planActionText, { color: COLORS.white }]}>New Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Days */}
          {plan.days?.map((day: any) => {
            const isExpanded = expandedDay === day.day;
            const dayColor = DAY_COLORS[day.day] || COLORS.primary;

            return (
              <View key={day.day} style={styles.dayCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => setExpandedDay(isExpanded ? null : day.day)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dayBadge, { backgroundColor: dayColor }]}>
                    <Text style={styles.dayBadgeText}>{day.day.substring(0, 3)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayTitle}>{day.day}</Text>
                    <Text style={styles.dayTheme}>{day.theme}</Text>
                  </View>
                  <View style={styles.sessionCount}>
                    <Text style={styles.sessionCountText}>{day.sessions?.length || 0}</Text>
                    <Text style={styles.sessionCountLabel}>sessions</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.dayContent}>
                    {day.sessions?.map((session: any, i: number) => (
                      <View key={i} style={styles.sessionCard}>
                        <View style={styles.sessionTime}>
                          <Ionicons name="time-outline" size={14} color={dayColor} />
                          <Text style={[styles.sessionTimeText, { color: dayColor }]}>{session.time}</Text>
                        </View>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.sessionDesc}>{session.description}</Text>

                        {session.duration && (
                          <View style={styles.sessionMeta}>
                            <Ionicons name="hourglass-outline" size={12} color={COLORS.textMuted} />
                            <Text style={styles.sessionMetaText}>{session.duration}</Text>
                          </View>
                        )}

                        {session.materials?.length > 0 && (
                          <View style={styles.sessionMaterials}>
                            <Text style={styles.sessionSubLabel}>Materials:</Text>
                            {session.materials.map((m: string, j: number) => (
                              <View key={j} style={styles.materialItem}>
                                <Ionicons name="cube-outline" size={12} color={COLORS.textMuted} />
                                <Text style={styles.materialText}>{m}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {session.senTips && (
                          <View style={styles.senTipBox}>
                            <Ionicons name="accessibility" size={14} color={COLORS.purple} />
                            <Text style={styles.senTipText}>{session.senTips}</Text>
                          </View>
                        )}

                        {session.printables?.length > 0 && (
                          <View style={styles.printableRow}>
                            {session.printables.map((p: string, k: number) => (
                              <View key={k} style={styles.printableBadge}>
                                <Ionicons name="print" size={12} color={COLORS.accentOrange} />
                                <Text style={styles.printableBadgeText}>{p}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}

                    {day.calmCornerFocus && (
                      <View style={styles.calmFocus}>
                        <Ionicons name="leaf" size={14} color={COLORS.secondary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.calmFocusLabel}>Calm Corner Focus</Text>
                          <Text style={styles.calmFocusText}>{day.calmCornerFocus}</Text>
                        </View>
                      </View>
                    )}

                    {day.assessmentFocus && (
                      <View style={styles.assessFocus}>
                        <Ionicons name="clipboard" size={14} color={COLORS.info} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.assessFocusLabel}>Assessment Focus</Text>
                          <Text style={styles.assessFocusText}>{day.assessmentFocus}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Weekly Summary */}
          {(plan.weeklyPrintables?.length > 0 || plan.weeklyMaterials?.length > 0) && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Weekly Preparation</Text>

              {plan.weeklyPrintables?.length > 0 && (
                <View style={styles.summaryBlock}>
                  <View style={styles.summaryBlockHeader}>
                    <Ionicons name="print" size={16} color={COLORS.accentOrange} />
                    <Text style={styles.summaryBlockTitle}>Printables Needed</Text>
                  </View>
                  {plan.weeklyPrintables.map((p: string, i: number) => (
                    <View key={i} style={styles.summaryItem}>
                      <Ionicons name="document-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.summaryItemText}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}

              {plan.weeklyMaterials?.length > 0 && (
                <View style={styles.summaryBlock}>
                  <View style={styles.summaryBlockHeader}>
                    <Ionicons name="cube" size={16} color={COLORS.secondary} />
                    <Text style={styles.summaryBlockTitle}>Materials Needed</Text>
                  </View>
                  {plan.weeklyMaterials.map((m: string, i: number) => (
                    <View key={i} style={styles.summaryItem}>
                      <Ionicons name="checkmark-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.summaryItemText}>{m}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {plan.senOverview && (
            <View style={styles.senOverviewBox}>
              <View style={styles.senOverviewHeader}>
                <Ionicons name="accessibility" size={18} color={COLORS.purple} />
                <Text style={styles.senOverviewTitle}>SEN Overview</Text>
              </View>
              <Text style={styles.senOverviewText}>{plan.senOverview}</Text>
            </View>
          )}

          {plan.parentNote && (
            <View style={styles.parentNoteBox}>
              <View style={styles.parentNoteHeader}>
                <Ionicons name="mail" size={18} color={COLORS.info} />
                <Text style={styles.parentNoteTitle}>Parent Communication</Text>
              </View>
              <Text style={styles.parentNoteText}>{plan.parentNote}</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Saved Plans */}
      {step === 'saved' && (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.savedHeader}>
            <TouchableOpacity onPress={() => setStep('config')} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.savedTitle}>Saved Plans ({savedPlans.length})</Text>
          </View>

          {savedPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open" size={48} color={COLORS.mediumGray} />
              <Text style={styles.emptyTitle}>No saved plans</Text>
              <Text style={styles.emptyText}>Generate a plan and save it to access it later.</Text>
            </View>
          ) : (
            <View style={styles.savedList}>
              {savedPlans.map(sp => (
                <View key={sp.id} style={styles.savedCard}>
                  <TouchableOpacity
                    style={styles.savedCardContent}
                    onPress={() => viewSavedPlan(sp)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar" size={24} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedCardTitle}>{sp.name}</Text>
                      <Text style={styles.savedCardSub}>{sp.ageGroup} | {new Date(sp.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.savedDeleteBtn}
                    onPress={() => deleteSavedPlan(sp.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  savedBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  savedBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  container: { flex: 1, paddingHorizontal: SPACING.lg },
  configCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.lg, ...SHADOWS.small },
  configHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  configTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  configDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#FFEBEE', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md },
  errorText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.error },
  sectionLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  toggleRow: { flexDirection: 'row', gap: SPACING.sm },
  toggleBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.lightGray },
  toggleBtnActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  toggleText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textMuted },
  toggleTextActive: { color: COLORS.primary, fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: SPACING.xs, marginTop: SPACING.lg },
  input: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.lightGray },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  focusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  focusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  focusText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '500' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.xxl, ...SHADOWS.medium },
  generateBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  disclaimer: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md, lineHeight: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.huge },
  loadingTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  loadingSteps: { marginTop: SPACING.xxl, gap: SPACING.md },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  loadingStepText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  // Plan view
  planHeader: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.lg, ...SHADOWS.small },
  planTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  planTheme: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  planOverview: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22, marginTop: SPACING.sm },
  planActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  planActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.bgLight, borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  planActionText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  // Day cards
  dayCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, marginTop: SPACING.md, overflow: 'hidden', ...SHADOWS.small },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg },
  dayBadge: { width: 44, height: 44, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  dayBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.white },
  dayTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  dayTheme: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  sessionCount: { alignItems: 'center' },
  sessionCountText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  sessionCountLabel: { fontSize: 10, color: COLORS.textMuted },
  dayContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  sessionCard: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md },
  sessionTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  sessionTimeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  sessionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  sessionDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: 4 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  sessionMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  sessionSubLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginTop: SPACING.sm, marginBottom: 4 },
  sessionMaterials: {},
  materialItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  materialText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  senTipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.bgPurple, borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm },
  senTipText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.purple, lineHeight: 18 },
  printableRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  printableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgOrange, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
  printableBadgeText: { fontSize: 10, fontWeight: '600', color: COLORS.accentOrange },
  calmFocus: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.bgGreen, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md },
  calmFocusLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.secondary },
  calmFocusText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: 2 },
  assessFocus: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm },
  assessFocusLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.info },
  assessFocusText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: 2 },
  // Summary
  summarySection: { marginTop: SPACING.xl },
  summaryTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  summaryBlock: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.small },
  summaryBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  summaryBlockTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  summaryItemText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  senOverviewBox: { backgroundColor: COLORS.bgPurple, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md },
  senOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  senOverviewTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.purple },
  senOverviewText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  parentNoteBox: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md },
  parentNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  parentNoteTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.info },
  parentNoteText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  // Saved plans
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.md },
  savedTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  savedList: { gap: SPACING.sm },
  savedCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOWS.small, overflow: 'hidden' },
  savedCardContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg },
  savedCardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  savedCardSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  savedDeleteBtn: { position: 'absolute', top: SPACING.md, right: SPACING.md, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.huge },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textLight, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
});
