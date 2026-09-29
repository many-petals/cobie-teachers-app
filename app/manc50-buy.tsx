import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './data/theme';

function schoolKeyFromName(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 54);
  return slug || 'school';
}

function checkoutAttemptId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export default function Manc50BuyScreen() {
  const router = useRouter();
  const { user, loading: authLoading, setShowAuthModal } = useAuth();
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const beginCheckout = async () => {
    if (!user) {
      setMessage('Sign in or create the lead teacher account before checkout. Your purchase will be safely linked to this account.');
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-checkout', {
      body: {
        school_key: schoolKeyFromName(schoolName),
        checkout_attempt_id: checkoutAttemptId(),
        school_name: schoolName.trim(),
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
      <View style={styles.card}>
        <Text style={styles.kicker}>MANC50 PILOT</Text>
        <Text style={styles.title}>Bring Cobie into your school</Text>
        <Text style={styles.body}>A three-month starter access period for one eligible school. Sign in first so payment, activation and recovery stay safely linked to the lead teacher account.</Text>
        <TextInput value={schoolName} onChangeText={setSchoolName} placeholder="School name" placeholderTextColor={COLORS.textMuted} style={styles.input} />
        {user?.email ? <Text style={styles.account}>Purchase will be linked to {user.email}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={() => void beginCheckout()} disabled={loading || authLoading || Boolean(user && !schoolName.trim())}>
          {loading || authLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{user ? 'Continue to secure checkout' : 'Sign in to continue'}</Text>}
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>Back to Cobie</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF', justifyContent: 'center', padding: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '800', letterSpacing: 1.2, marginBottom: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT_SIZES.xxl, fontWeight: '800', marginBottom: SPACING.md },
  body: { color: COLORS.textMuted, fontSize: FONT_SIZES.md, lineHeight: 24, marginBottom: SPACING.xl },
  input: { borderWidth: 1, borderColor: '#BCD2E0', borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, minHeight: 48, marginBottom: SPACING.md },
  account: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  message: { marginTop: SPACING.md, color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
