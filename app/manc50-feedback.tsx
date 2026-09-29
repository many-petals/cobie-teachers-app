import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from './data/theme';

type Stage = 'onboarding' | 'week_2' | 'end';

const STAGES: { value: Stage; label: string }[] = [
  { value: 'onboarding', label: 'First use' },
  { value: 'week_2', label: 'Week 2' },
  { value: 'end', label: 'End of pilot' },
];

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.ratingBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.ratingRow} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[styles.ratingButton, value === rating && styles.ratingButtonSelected]}
            onPress={() => onChange(rating)}
            accessibilityRole="radio"
            accessibilityLabel={`${label}: ${rating} out of 5`}
            accessibilityState={{ selected: value === rating }}
          >
            <Text style={[styles.ratingText, value === rating && styles.ratingTextSelected]}>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function Manc50FeedbackScreen() {
  const router = useRouter();
  const { user, billingStatus, billingLoading, setShowAuthModal } = useAuth();
  const [stage, setStage] = useState<Stage>('onboarding');
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [lessonClarity, setLessonClarity] = useState(0);
  const [pupilEngagement, setPupilEngagement] = useState(0);
  const [sendSuitability, setSendSuitability] = useState(0);
  const [recommend, setRecommend] = useState(-1);
  const [workedWell, setWorkedWell] = useState('');
  const [improve, setImprove] = useState('');
  const [followUpOk, setFollowUpOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const entitlementId = billingStatus?.status === 'pilot' ? billingStatus.pilotEntitlementId : undefined;
  const complete = [easeOfUse, lessonClarity, pupilEngagement, sendSuitability].every((rating) => rating >= 1)
    && recommend >= 0;

  const submit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!entitlementId || !complete) {
      setMessage('Complete every rating before sending feedback.');
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-feedback', {
      body: {
        entitlement_id: entitlementId,
        stage,
        ease_of_use_rating: easeOfUse,
        lesson_clarity_rating: lessonClarity,
        pupil_engagement_rating: pupilEngagement,
        send_suitability_rating: sendSuitability,
        recommend_rating: recommend,
        worked_well: workedWell.trim(),
        improve: improve.trim(),
        follow_up_ok: followUpOk,
      },
    });
    setSubmitting(false);

    if (error || !data?.saved) {
      setSuccess(false);
      setMessage(data?.error ?? 'We could not save your feedback. Please try again.');
      return;
    }

    setSuccess(true);
    setMessage('Thank you. Your feedback has been saved and will guide the next pilot improvement.');
  };

  if (billingLoading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator color={COLORS.primary} /><Text style={styles.helper}>Checking pilot access…</Text></SafeAreaView>;
  }

  if (!user || !entitlementId) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>MANC50 pilot feedback</Text>
        <Text style={styles.body}>{user ? 'Pilot access is required to submit this form.' : 'Sign in with the lead-teacher pilot account to continue.'}</Text>
        {!user ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAuthModal(true)} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => router.replace('/')} accessibilityRole="button"><Text style={styles.link}>Back to Cobie</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.kicker}>MANC50 PILOT</Text>
          <Text style={styles.title}>Help us improve Cobie</Text>
          <Text style={styles.body}>This takes about two minutes. Do not include pupil names or identifying information.</Text>

          <Text style={styles.label}>When are you answering?</Text>
          <View style={styles.choiceRow} accessibilityRole="radiogroup" accessibilityLabel="Feedback stage">
            {STAGES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.choice, stage === option.value && styles.choiceSelected]}
                onPress={() => setStage(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: stage === option.value }}
              >
                <Text style={[styles.choiceText, stage === option.value && styles.choiceTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.scaleHelp}>1 = needs major improvement · 5 = excellent</Text>
          <RatingRow label="Ease of use" value={easeOfUse} onChange={setEaseOfUse} />
          <RatingRow label="Lesson clarity" value={lessonClarity} onChange={setLessonClarity} />
          <RatingRow label="Pupil engagement" value={pupilEngagement} onChange={setPupilEngagement} />
          <RatingRow label="SEND suitability" value={sendSuitability} onChange={setSendSuitability} />

          <Text style={styles.label}>How likely are you to recommend Cobie to another setting? (0–10)</Text>
          <View style={styles.npsRow} accessibilityRole="radiogroup" accessibilityLabel="Recommendation rating">
            {Array.from({ length: 11 }, (_, rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.npsButton, recommend === rating && styles.ratingButtonSelected]}
                onPress={() => setRecommend(rating)}
                accessibilityRole="radio"
                accessibilityLabel={`${rating} out of 10`}
                accessibilityState={{ selected: recommend === rating }}
              >
                <Text style={[styles.npsText, recommend === rating && styles.ratingTextSelected]}>{rating}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>What worked well? (optional)</Text>
          <TextInput
            value={workedWell}
            onChangeText={setWorkedWell}
            multiline
            maxLength={2000}
            style={styles.textArea}
            accessibilityLabel="What worked well"
            placeholder="A short example, without pupil-identifying details"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>What should we improve? (optional)</Text>
          <TextInput
            value={improve}
            onChangeText={setImprove}
            multiline
            maxLength={2000}
            style={styles.textArea}
            accessibilityLabel="What should we improve"
            placeholder="Tell us what would make the next use easier"
            placeholderTextColor={COLORS.textMuted}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Many Petals may contact me about this feedback</Text>
            <Switch value={followUpOk} onValueChange={setFollowUpOk} accessibilityLabel="Allow feedback follow-up" />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!complete || submitting) && styles.disabled]}
            onPress={() => void submit()}
            disabled={!complete || submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: !complete || submitting }}
          >
            {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Send feedback</Text>}
          </TouchableOpacity>
          {message ? <Text accessibilityRole="alert" style={[styles.message, success ? styles.success : styles.error]}>{message}</Text> : null}
          <TouchableOpacity onPress={() => router.replace('/')} accessibilityRole="button"><Text style={styles.link}>Back to Cobie</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  center: { flex: 1, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  content: { padding: SPACING.lg, alignItems: 'center' },
  card: { width: '100%', maxWidth: 720, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl },
  kicker: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '800', letterSpacing: 1.2, marginBottom: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT_SIZES.xxl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.md },
  body: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, lineHeight: 24, textAlign: 'center', marginBottom: SPACING.xl },
  helper: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  label: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  scaleHelp: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: SPACING.xl },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  choice: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  choiceSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  choiceText: { color: COLORS.text, fontWeight: '600' },
  choiceTextSelected: { color: COLORS.white },
  ratingBlock: { marginTop: SPACING.md },
  ratingRow: { flexDirection: 'row', gap: SPACING.sm },
  ratingButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#BCD2E0', alignItems: 'center', justifyContent: 'center' },
  ratingButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  ratingText: { color: COLORS.text, fontWeight: '700' },
  ratingTextSelected: { color: COLORS.white },
  npsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  npsButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#BCD2E0', alignItems: 'center', justifyContent: 'center' },
  npsText: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  textArea: { minHeight: 100, borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md, marginTop: SPACING.xl },
  switchText: { flex: 1, color: COLORS.text, fontSize: FONT_SIZES.sm },
  primaryButton: { minHeight: 48, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, marginTop: SPACING.xl },
  primaryButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  message: { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, lineHeight: 20, textAlign: 'center' },
  success: { color: '#067647' },
  error: { color: '#B42318' },
  link: { color: COLORS.primary, fontWeight: '700', textAlign: 'center', marginTop: SPACING.lg },
});
