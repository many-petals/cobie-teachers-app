import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from './data/theme';

function isStrongEnough(password: string) {
  return password.trim().length >= 6;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let active = true;

    const checkRecoverySession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (active) {
          setCanReset(Boolean(session));
        }
      } catch {
        if (active) {
          setCanReset(false);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCanReset(Boolean(session));
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!canReset) {
      setError('This reset link is missing or has expired. Please request a new password reset email.');
      return;
    }

    if (!isStrongEnough(password)) {
      setError('Your new password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess('Password updated successfully. You can now return to the app and sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Choose a New Password</Text>
          <Text style={styles.subtitle}>
            Use a secure password you have not used before. Once it is saved, you can sign back into your account.
          </Text>

          {checkingSession ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Checking your reset link...</Text>
            </View>
          ) : (
            <>
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={COLORS.mediumGray}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.7}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.mediumGray}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor={COLORS.mediumGray}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)} activeOpacity={0.7}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.mediumGray}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading || checkingSession}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Save New Password</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.replace('/')}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#E8F5E9',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  successText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
