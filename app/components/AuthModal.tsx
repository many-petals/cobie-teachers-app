import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { label: 'EYFS Teacher', value: 'EYFS Teacher' },
  { label: 'KS1 Teacher', value: 'KS1 Teacher' },
  { label: 'SEN Support', value: 'SEN Support' },
  { label: 'Teaching Assistant', value: 'Teaching Assistant' },
  { label: 'Pastoral Lead', value: 'Pastoral Lead' },
];

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState('EYFS Teacher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setSchool('');
    setRole('EYFS Teacher');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
    setMode('login');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    } else {
      const result = await signUp(email.trim(), password, name.trim(), school.trim(), role);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      }
    }

    setLoading(false);
  };

  return (
    <Modal visible={showAuthModal} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="flower" size={24} color={COLORS.secondary} />
              <Text style={styles.modalTitle}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to save your favourites, track progress, and sync across devices.'
                : 'Join the Cobie Teacher Pack community to save your preferences.'}
            </Text>

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

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.mediumGray} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@school.co.uk"
                placeholderTextColor={COLORS.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.mediumGray}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>
            </View>

            {/* Signup fields */}
            {mode === 'signup' && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.mediumGray} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                </View>

                <Text style={styles.label}>School (optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="school-outline" size={20} color={COLORS.mediumGray} />
                  <TextInput
                    style={styles.input}
                    value={school}
                    onChangeText={setSchool}
                    placeholder="Your school name"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                </View>

                <Text style={styles.label}>Your Role</Text>
                <View style={styles.roleGrid}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r.value}
                      style={[styles.roleChip, role === r.value && styles.roleChipActive]}
                      onPress={() => setRole(r.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle mode */}
            <TouchableOpacity
              style={styles.toggleMode}
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.toggleLink}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* GDPR notice */}
            <View style={styles.gdprNotice}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.gdprText}>
                GDPR-safe. No child data is collected. Your account stores only your teaching preferences.
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '92%',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.lg,
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
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    height: '100%',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  roleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  roleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  roleTextActive: {
    color: COLORS.white,
    fontWeight: '700',
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
  submitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  toggleMode: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  toggleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  toggleLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  gdprNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  gdprText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
