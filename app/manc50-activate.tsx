import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { clearPendingManc50Token, loadPendingManc50Token, saveManc50Access } from './lib/manc50';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from './data/theme';

export default function Manc50ActivateScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadPendingManc50Token().then(setToken);
  }, []);

  const activate = async () => {
    setStatus('loading');
    setMessage('');
    const { data, error } = await supabase.functions.invoke('manc50-activate', {
      body: { activation_token: token.trim() },
    });
    if (error || !data?.activated) {
      setStatus('error');
      setMessage(data?.error ?? 'We could not activate this school access. Please try again.');
      return;
    }
    await saveManc50Access({ entitlementId: data.entitlement_id, expiresAt: data.expires_at });
    await clearPendingManc50Token();
    setStatus('success');
    setMessage(`Access is active until ${new Date(data.expires_at).toLocaleDateString('en-GB')}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.kicker}>MANC50 SCHOOL ACCESS</Text>
        <Text style={styles.title}>Activate your classroom access</Text>
        <Text style={styles.body}>Paste the activation token from your MANC50 checkout confirmation. Your three-month access period starts when you activate it.</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Paste activation token"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          editable={status !== 'loading' && status !== 'success'}
        />
        <TouchableOpacity style={styles.button} onPress={() => void activate()} disabled={status === 'loading' || !token.trim()}>
          {status === 'loading' ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Activate access</Text>}
        </TouchableOpacity>
        {message ? <Text style={[styles.message, status === 'error' ? styles.error : styles.success]}>{message}</Text> : null}
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
  message: { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  error: { color: '#B42318' },
  success: { color: '#067647' },
  backButton: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.primary, fontWeight: '700' },
});
