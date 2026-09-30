import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './data/theme';

type EligibleSchool = {
  dfe_urn: number;
  school_name: string;
  postcode: string;
  address_line_1: string;
  locality: string | null;
  town: string | null;
  setting_type: string;
  send_priority: boolean;
};

function checkoutAttemptId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizedPostcode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

function schoolAddress(school: EligibleSchool): string {
  return [school.address_line_1, school.locality, school.town, school.postcode].filter(Boolean).join(', ');
}

export default function Manc50BuyScreen() {
  const router = useRouter();
  const { user, loading: authLoading, setShowAuthModal } = useAuth();
  const [postcode, setPostcode] = useState('');
  const [schools, setSchools] = useState<EligibleSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<EligibleSchool | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updatePostcode = (value: string) => {
    setPostcode(value);
    setSchools([]);
    setSelectedSchool(null);
    setMessage('');
  };

  const findSchools = async () => {
    if (!user) {
      setMessage('Sign in or create the lead teacher account before selecting the school.');
      setShowAuthModal(true);
      return;
    }
    const lookupPostcode = normalizedPostcode(postcode);
    if (!/^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$/.test(lookupPostcode.replace(/\s/g, ''))) {
      setMessage('Enter the full school postcode, for example M16 0JQ.');
      return;
    }

    setSearching(true);
    setMessage('');
    setSchools([]);
    setSelectedSchool(null);
    const { data, error } = await supabase.functions.invoke('manc50-schools', {
      body: { postcode: lookupPostcode },
    });
    setSearching(false);

    const matches = Array.isArray(data?.schools) ? data.schools as EligibleSchool[] : [];
    if (error || !matches.length) {
      setMessage(data?.error ?? 'No eligible MANC50 school was found at that postcode. Check the postcode or contact info@manypetals.co.uk.');
      return;
    }
    setSchools(matches);
    if (matches.length === 1) setSelectedSchool(matches[0]);
    setMessage(matches.length === 1 ? 'Eligible school found. Check the school and delivery address below.' : 'Choose the correct eligible school below.');
  };

  const beginCheckout = async () => {
    if (!user) {
      setMessage('Sign in or create the lead teacher account before checkout. Your purchase will be safely linked to this account.');
      setShowAuthModal(true);
      return;
    }
    if (!selectedSchool) {
      setMessage('Find and select the eligible school before checkout.');
      return;
    }

    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-checkout', {
      body: {
        checkout_attempt_id: checkoutAttemptId(),
        school_urn: selectedSchool.dfe_urn,
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
          <Text style={styles.body}>A three-month starter access period for one eligible Manchester school serving children aged 3–7. Sign in first so payment, delivery, activation and recovery stay linked to the lead teacher account.</Text>

          <Text style={styles.label}>School postcode</Text>
          <TextInput
            value={postcode}
            onChangeText={updatePostcode}
            autoCapitalize="characters"
            autoComplete="postal-code"
            placeholder="M16 0JQ"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            accessibilityLabel="School postcode"
          />
          <TouchableOpacity
            style={styles.lookupButton}
            onPress={() => void findSchools()}
            disabled={searching || authLoading}
            accessibilityRole="button"
            accessibilityState={{ disabled: searching || authLoading }}
          >
            {searching || authLoading
              ? <ActivityIndicator color={COLORS.primary} />
              : <Text style={styles.lookupButtonText}>{user ? 'Find eligible school' : 'Sign in to find school'}</Text>}
          </TouchableOpacity>

          {schools.length ? (
            <View style={styles.schoolChoices} accessibilityRole="radiogroup" accessibilityLabel="Eligible schools">
              {schools.map((school) => {
                const selected = selectedSchool?.dfe_urn === school.dfe_urn;
                return (
                  <TouchableOpacity
                    key={school.dfe_urn}
                    style={[styles.schoolChoice, selected && styles.schoolChoiceSelected]}
                    onPress={() => {
                      setSelectedSchool(school);
                      setMessage('School selected. The starter pack will be sent to the official address shown below.');
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${school.school_name}, DfE reference ${school.dfe_urn}`}
                  >
                    <Text style={[styles.schoolName, selected && styles.schoolTextSelected]}>{school.school_name}</Text>
                    <Text style={[styles.schoolDetail, selected && styles.schoolTextSelected]}>{schoolAddress(school)}</Text>
                    <Text style={[styles.schoolDetail, selected && styles.schoolTextSelected]}>DfE URN {school.dfe_urn} · {school.setting_type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {user?.email ? <Text style={styles.account}>Purchase and activation will be linked to {user.email}</Text> : null}
          <TouchableOpacity
            style={[styles.button, Boolean(user && !selectedSchool) && styles.buttonDisabled]}
            onPress={() => void beginCheckout()}
            disabled={loading || authLoading || Boolean(user && !selectedSchool)}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || authLoading || Boolean(user && !selectedSchool) }}
          >
            {loading || authLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{user ? 'Continue to secure checkout' : 'Sign in to continue'}</Text>}
          </TouchableOpacity>
          {message ? <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text> : null}
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
  input: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, minHeight: 48, marginBottom: SPACING.sm },
  lookupButton: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  lookupButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '800' },
  schoolChoices: { gap: SPACING.sm, marginBottom: SPACING.md },
  schoolChoice: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.md, padding: SPACING.md },
  schoolChoiceSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  schoolName: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '800', marginBottom: SPACING.xs },
  schoolDetail: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  schoolTextSelected: { color: COLORS.white },
  account: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  message: { marginTop: SPACING.md, color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
