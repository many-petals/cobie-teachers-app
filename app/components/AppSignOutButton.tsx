import React from 'react';
import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../data/theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type AppSignOutButtonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function AppSignOutButton({ style }: AppSignOutButtonProps) {
  const { user, signOut } = useAuth();
  const { showConfirm, showToast } = useToast();

  if (!user) return null;

  const handlePress = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Sign out of your teacher account on this device now?',
      confirmText: 'Sign Out',
      onConfirm: async () => {
        await signOut();
        showToast('Signed Out', 'You have been signed out on this device.', 'info');
      },
    });
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F7CACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
