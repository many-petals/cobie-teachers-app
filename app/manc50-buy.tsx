import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { savePendingManc50Token } from './lib/manc50';
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
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const beginCheckout = async () => {
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-checkout', {
      body: {
        school_key: schoolKeyFromName(schoolName),
        checkout_attempt_id: checkoutAttemptId(),
        school_name: schoolName.trim(),
        contact_email: email.trim().toLowerCase(),
      },
    });
    setLoading(false);
    if (error || !data?.checkout_url) {
      setMessage(data?.error ?? 'Checkout is not available yet. Please try again later.');
      return;
    }
    if (data.activation_token) await savePendingManc50Token(data.activation_token);
    setMessage('Your secure checkout is ready. After payment, return to Cobie and your activation token will be ready to use.');
    await Linking.openURL(data.checkout_url);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.kicker}>MANC50 PILOT</Text>
        <Text style={styles.title}>Bring Cobie into your school</Text>
        <Text style={styles.body}>A three-month starter access period for one eligible school. Access begins when your school activates its token.</Text>
        <TextInput value={schoolName} onChangeText={setSchoolName} placeholder="School name" placeholderTextColor={COLORS.textMuted} style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="School contact email" placeholderTextColor={COLORS.textMuted} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={() => void beginCheckout()} disabled={loading || !schoolName.trim() || !email.trim()}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Continue to secure checkout</Text>}
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
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  message: { marginTop: SPACING.md, color: COLORS.textMuted, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
