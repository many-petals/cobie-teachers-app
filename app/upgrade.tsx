import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { LESSONS } from './data/lessons';
import { openBilling } from '../lib/billing';

export default function UpgradeScreen() {
  const router = useRouter();
  const { checkout } = useLocalSearchParams<{ checkout?: string }>();
  const { user, loading, setShowAuthModal, hasFullAccess, billingLoading, billingError, billingStatus, refreshBilling } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || checkout !== 'success') return;
    // The return URL prompts a Stripe check; it is never proof of payment.
    void refreshBilling();
  }, [user?.id, checkout, refreshBilling]);

  const handleBilling = async (action: 'checkout' | 'portal') => {
    if (!user) { setShowAuthModal(true); return; }
    setBusy(true);
    setError(null);
    try { await openBilling(action); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not open billing. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{hasFullAccess ? 'Your Full Access' : 'Unlock All Emotional Literacy Lessons'}</Text>
      <Text style={styles.item}>✓ {LESSONS.length} complete classroom lessons</Text>
      <Text style={styles.item}>✓ Full lesson plans</Text>
      <Text style={styles.item}>✓ SEN differentiation ideas</Text>
      <Text style={styles.item}>✓ Printable worksheets</Text>
      <Text style={styles.item}>✓ Activity tracker</Text>
      {loading || billingLoading ? <ActivityIndicator accessibilityLabel="Checking your access" /> : null}
      {hasFullAccess ? <Text style={styles.message}>Your {billingStatus?.status === 'pilot' ? 'pilot' : 'subscription'} access is active.</Text> : null}
      {checkout === 'success' && !hasFullAccess && !billingLoading ? (
        <Text style={styles.message}>We have not confirmed access yet. If you completed checkout, use Check access again before starting another subscription.</Text>
      ) : null}
      {checkout === 'cancelled' ? <Text style={styles.message}>Checkout was cancelled. You can continue using the free preview.</Text> : null}
      {error || billingError ? <Text accessibilityRole="alert" style={styles.error}>{error || billingError}</Text> : null}
      {!hasFullAccess ? (
        <TouchableOpacity accessibilityRole="button" disabled={busy || loading || billingLoading} style={styles.button} onPress={() => void handleBilling('checkout')}>
          <Text style={styles.buttonText}>{busy ? 'Opening secure checkout…' : user ? 'Continue to secure checkout' : 'Sign in to upgrade'}</Text>
        </TouchableOpacity>
      ) : null}
      {!hasFullAccess ? <Text style={styles.message}>New subscribers receive a 14-day trial. Stripe shows the price, first payment date and subscription terms before you confirm. Returning subscribers may not be eligible for another trial.</Text> : null}
      {billingStatus?.canManageBilling ? (
        <TouchableOpacity accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void handleBilling('portal')}>
          <Text style={styles.buttonText}>Manage billing or cancel</Text>
        </TouchableOpacity>
      ) : null}
      {user ? (
        <TouchableOpacity accessibilityRole="button" disabled={billingLoading || busy} onPress={() => void refreshBilling()}>
          <Text style={styles.link}>Check access again</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/lessons')}>
        <Text style={styles.link}>Back to lessons</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff', alignSelf: 'center', width: '100%', maxWidth: 680 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  item: { fontSize: 16, marginBottom: 10 },
  button: { marginTop: 24, backgroundColor: '#6B46C1', padding: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  message: { marginTop: 16, color: '#444', lineHeight: 22 },
  error: { marginTop: 16, color: '#A31621', lineHeight: 22 },
  link: { paddingVertical: 16, textAlign: 'center', color: '#5934AD', fontSize: 16 },
});
