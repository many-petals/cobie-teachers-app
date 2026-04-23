import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../data/theme';

interface RequireAuthProps {
  title: string;
  message: string;
  children: React.ReactNode;
}

export default function RequireAuth({ title, message, children }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading, setShowAuthModal } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Checking your session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowAuthModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Sign In to Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  lockedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
