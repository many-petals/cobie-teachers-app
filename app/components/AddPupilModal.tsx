import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (pupil: { display_code: string; age_group: 'EYFS' | 'KS1'; sen_status: boolean; notes: string }) => void;
  existingCodes: string[];
}

export default function AddPupilModal({ visible, onClose, onAdd, existingCodes }: Props) {
  const [code, setCode] = useState('');
  const [ageGroup, setAgeGroup] = useState<'EYFS' | 'KS1'>('EYFS');
  const [senStatus, setSenStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const suggestedCode = `P${existingCodes.length + 1}`;

  const handleAdd = () => {
    const finalCode = code.trim() || suggestedCode;
    
    if (existingCodes.includes(finalCode)) {
      setError('This code is already in use. Please choose a different one.');
      return;
    }
    
    if (finalCode.length > 10) {
      setError('Code must be 10 characters or fewer.');
      return;
    }

    onAdd({
      display_code: finalCode,
      age_group: ageGroup,
      sen_status: senStatus,
      notes: notes.trim(),
    });

    // Reset form
    setCode('');
    setAgeGroup('EYFS');
    setSenStatus(false);
    setNotes('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Pupil</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* GDPR Notice */}
            <View style={styles.gdprNotice}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              <Text style={styles.gdprText}>
                GDPR Safe: Use anonymous codes only (e.g. P1, Child A). Do not enter real names or identifiable information.
              </Text>
            </View>

            {/* Anonymous Code */}
            <View style={styles.field}>
              <Text style={styles.label}>Anonymous Code</Text>
              <Text style={styles.hint}>A short code to identify this pupil (no real names)</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={(t) => { setCode(t); setError(''); }}
                placeholder={suggestedCode}
                placeholderTextColor={COLORS.textMuted}
                maxLength={10}
                autoCapitalize="characters"
              />
              <Text style={styles.suggestion}>
                Suggested: {suggestedCode}
              </Text>
            </View>

            {/* Age Group */}
            <View style={styles.field}>
              <Text style={styles.label}>Age Group</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, ageGroup === 'EYFS' && styles.toggleActive]}
                  onPress={() => setAgeGroup('EYFS')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, ageGroup === 'EYFS' && styles.toggleTextActive]}>
                    EYFS (3-5)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, ageGroup === 'KS1' && styles.toggleActive]}
                  onPress={() => setAgeGroup('KS1')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, ageGroup === 'KS1' && styles.toggleTextActive]}>
                    KS1 (5-7)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SEN Status */}
            <View style={styles.field}>
              <Text style={styles.label}>SEN/SEND Support</Text>
              <TouchableOpacity
                style={[styles.senToggle, senStatus && styles.senToggleActive]}
                onPress={() => setSenStatus(!senStatus)}
                activeOpacity={0.7}
              >
                <View style={[styles.senCheckbox, senStatus && styles.senCheckboxActive]}>
                  {senStatus ? (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  ) : null}
                </View>
                <Text style={[styles.senText, senStatus && styles.senTextActive]}>
                  This pupil has identified SEN/SEND needs
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Notes (optional)</Text>
              <Text style={styles.hint}>General notes only - no identifiable information</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. sensory sensitivities, communication needs"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={20} color={COLORS.white} />
                <Text style={styles.addText}>Add Pupil</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '90%',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
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
  gdprNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  gdprText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: 20,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.offWhite,
  },
  textArea: {
    minHeight: 80,
    paddingTop: SPACING.md,
  },
  suggestion: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  toggleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.bgLight,
  },
  toggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  senToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.offWhite,
  },
  senToggleActive: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.bgPurple,
  },
  senCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senCheckboxActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  senText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  senTextActive: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  addBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  addText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
