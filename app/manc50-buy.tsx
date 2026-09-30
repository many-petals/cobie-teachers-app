import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './data/theme';

const SETTING_TYPES = ['Special school', 'SEND provision', 'Mainstream primary', 'Nursery / early years', 'Other eligible setting'] as const;

function checkoutAttemptId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export default function Manc50BuyScreen() {
  const router = useRouter();
  const { user, loading: authLoading, setShowAuthModal } = useAuth();
  const [schoolName, setSchoolName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [settingType, setSettingType] = useState('');
  const [servesAgesThreeToSeven, setServesAgesThreeToSeven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const beginCheckout = async () => {
    if (!user) {
      setMessage('Sign in or create the lead teacher account before checkout. Your purchase will be safely linked to this account.');
      setShowAuthModal(true);
      return;
    }
    const normalizedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!schoolName.trim() || !/^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$/.test(normalizedPostcode.replace(/\s/g, '')) || !settingType || !servesAgesThreeToSeven) {
      setMessage('Enter the school name and UK postcode, choose the setting type, and confirm that it serves children aged 3-7.');
      return;
    }
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-checkout', {
      body: {
        checkout_attempt_id: checkoutAttemptId(),
        school_name: schoolName.trim(),
        postcode: normalizedPostcode,
        setting_type: settingType,
        serves_ages_3_7: servesAgesThreeToSeven,
      },
    });
    setLoading(false);
    if (error || !data?.checkout_url) {
      setMessage(data?.error ?? 'Checkout is not available yet. Please try again later.');
      return;
    }
    setMessage('Your secure checkout is ready. After payment, return to Cobie while signed in to activate access.');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(data.checkout_url);
    } else {
      await Linking.openURL(data.checkout_url);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.kicker}>MANC50 PILOT</Text>
        <Text style={styles.title}>Bring Cobie into your school</Text>
        <Text style={styles.body}>A three-month starter access period for one eligible school. Sign in first so payment, activation and recovery stay safely linked to the lead teacher account.</Text>
        <Text style={styles.label}>School or setting name</Text>
        <TextInput value={schoolName} onChangeText={setSchoolName} placeholder="School name" placeholderTextColor={COLORS.textMuted} style={styles.input} accessibilityLabel="School or setting name" />
        <Text style={styles.label}>School or setting postcode</Text>
        <TextInput value={postcode} onChangeText={setPostcode} autoCapitalize="characters" placeholder="M16 0JQ" placeholderTextColor={COLORS.textMuted} style={styles.input} accessibilityLabel="School or setting postcode" />
        <Text style={styles.label}>Setting type</Text>
        <View style={styles.settingChoices} accessibilityRole="radiogroup" accessibilityLabel="Setting type">
          {SETTING_TYPES.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.settingChoice, settingType === option && styles.settingChoiceSelected]}
              onPress={() => setSettingType(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected: settingType === option }}
            >
              <Text style={[styles.settingChoiceText, settingType === option && styles.settingChoiceTextSelected]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmText}>I confirm this setting serves children aged 3–7.</Text>
          <Switch value={servesAgesThreeToSeven} onValueChange={setServesAgesThreeToSeven} accessibilityLabel="Confirm this setting serves children aged 3 to 7" />
        </View>
        {user?.email ? <Text style={styles.account}>Purchase will be linked to {user.email}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={() => void beginCheckout()} disabled={loading || authLoading || Boolean(user && (!schoolName.trim() || !postcode.trim() || !settingType || !servesAgesThreeToSeven))} accessibilityRole="button" accessibilityState={{ disabled: loading || authLoading || Boolean(user && (!schoolName.trim() || !postcode.trim() || !settingType || !servesAgesThreeToSeven)) }}>
          {loading || authLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{user ? 'Continue to secure checkout' : 'Sign in to continue'}</Text>}
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button"><Text style={styles.backText}>Back to Cobie</Text></TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF', justifyContent: 'center', padding: SPACING.lg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '800', letterSpacing: 1.2, marginBottom: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT_SIZES.xxl, fontWeight: '800', marginBottom: SPACING.md },
  body: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, lineHeight: 24, marginBottom: SPACING.xl },
  label: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: SPACING.xs },
  input: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, minHeight: 48, marginBottom: SPACING.md },
  settingChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  settingChoice: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  settingChoiceSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  settingChoiceText: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  settingChoiceTextSelected: { color: COLORS.white },
  confirmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.md },
  confirmText: { flex: 1, color: COLORS.text, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  account: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  message: { marginTop: SPACING.md, color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
