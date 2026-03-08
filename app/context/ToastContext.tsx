import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  showConfirm: (options: ConfirmDialog) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showConfirm: () => {},
});

const ICON_MAP = {
  success: 'checkmark-circle' as const,
  info: 'information-circle' as const,
  warning: 'warning' as const,
  error: 'alert-circle' as const,
};

const COLOR_MAP = {
  success: COLORS.success,
  info: COLORS.info,
  warning: COLORS.warning,
  error: COLORS.error,
};

const BG_MAP = {
  success: '#E8F5E9',
  info: '#E3F2FD',
  warning: '#FFF3E0',
  error: '#FFEBEE',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);
  const counterRef = useRef(0);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = String(++counterRef.current);
    const toast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, toast]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const showConfirm = useCallback((options: ConfirmDialog) => {
    setConfirm(options);
  }, []);

  const handleConfirm = () => {
    confirm?.onConfirm();
    setConfirm(null);
  };

  const handleCancel = () => {
    confirm?.onCancel?.();
    setConfirm(null);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Messages */}
      {toasts.length > 0 && (
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((toast) => (
            <TouchableOpacity
              key={toast.id}
              style={[styles.toast, { backgroundColor: BG_MAP[toast.type] }]}
              onPress={() => dismissToast(toast.id)}
              activeOpacity={0.9}
            >
              <Ionicons
                name={ICON_MAP[toast.type]}
                size={22}
                color={COLOR_MAP[toast.type]}
              />
              <View style={styles.toastContent}>
                <Text style={[styles.toastTitle, { color: COLOR_MAP[toast.type] }]}>
                  {toast.title}
                </Text>
                {toast.message ? (
                  <Text style={styles.toastMessage}>{toast.message}</Text>
                ) : null}
              </View>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <Modal visible transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>{confirm.title}</Text>
              <Text style={styles.confirmMessage}>{confirm.message}</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmCancelText}>
                    {confirm.cancelText || 'Cancel'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmOkBtn}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmOkText}>
                    {confirm.confirmText || 'OK'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    maxWidth: 500,
    width: '90%',
    gap: SPACING.md,
    ...SHADOWS.large,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  toastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  confirmBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxWidth: 400,
    width: '100%',
    ...SHADOWS.large,
  },
  confirmTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  confirmMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  confirmCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  confirmOkBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
