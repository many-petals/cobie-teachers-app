import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { clearPendingManc50Token, loadPendingManc50Token, saveManc50Access } from './lib/manc50';
import { useAuth } from './context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './data/theme';

export default function Manc50ActivateScreen() {
  const router = useRouter();
  const { user, loading: authLoading, setShowAuthModal, refreshBilling } = useAuth();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'auth' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadPendingManc50Token().then(setToken);
  }, []);

  useEffect(() => {
    if (user && status === 'auth') {
      setStatus('idle');
      setMessage('You are signed in. Select Activate access to finish.');
    }
  }, [status, user]);

  const activate = async () => {
    if (!user) {
      setStatus('auth');
      setMessage('Sign in or create the lead teacher account before activating this school access.');
      setShowAuthModal(true);
      return;
    }
    setStatus('loading');
    setMessage('');
    let data: { activated?: boolean; entitlement_id?: string; expires_at?: string; error?: string } | null = null;
    let error: unknown = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await supabase.functions.invoke('manc50-activate', {
        body: token.trim() ? { activation_token: token.trim() } : {},
      });
      data = result.data;
      error = result.error;
      if (!error && data?.activated) break;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    if (error || !data?.activated || !data.entitlement_id || !data.expires_at) {
      setStatus('error');
      setMessage(data?.error ?? 'We could not activate this school access. Please try again.');
      return;
    }
    await saveManc50Access({ entitlementId: data.entitlement_id, expiresAt: data.expires_at });
    await clearPendingManc50Token();
    const verified = await refreshBilling();
    if (!verified?.hasFullAccess || verified.pilotEntitlementId !== data.entitlement_id) {
      setStatus('error');
      setMessage('Your token was activated, but access could not be verified yet. Refresh the page or sign in again; do not reuse the token.');
      return;
    }
    setStatus('success');
    setMessage(`Access is active until ${new Date(data.expires_at).toLocaleDateString('en-GB')}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.kicker}>MANC50 SCHOOL ACCESS</Text>
        <Text style={styles.title}>Activate your classroom access</Text>
        <Text style={styles.body}>Sign in as the lead teacher who completed checkout, then activate your three-month access. Older purchases can still paste their activation token below.</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Older purchase token (optional)"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          editable={status !== 'loading' && status !== 'success'}
        />
        <TouchableOpacity style={styles.button} onPress={() => void activate()} disabled={status === 'loading' || authLoading || status === 'success'}>
          {status === 'loading' || authLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{user ? 'Activate paid access' : 'Sign in to activate'}</Text>}
        </TouchableOpacity>
        {message ? <Text style={[styles.message, status === 'error' ? styles.error : status === 'success' ? styles.success : styles.info]}>{message}</Text> : null}
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}><Text style={styles.backText}>Back to Cobie</Text></TouchableOpacity>
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
  message: { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  error: { color: '#B42318' },
  success: { color: '#067647' },
  info: { color: COLORS.primary },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
