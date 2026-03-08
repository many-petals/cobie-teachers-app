import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { supabase } from '../lib/supabase';

interface DifferentiationWizardProps {
  visible: boolean;
  onClose: () => void;
  resourceType: 'lesson' | 'activity';
  title: string;
  description: string;
  instructions: string;
  materials: string;
  existingAdaptations: string;
}

const SEN_TYPES = [
  { id: 'autism', label: 'Autism (ASC)', icon: 'infinite', color: '#7E57C2' },
  { id: 'adhd', label: 'ADHD', icon: 'flash', color: '#FF7043' },
  { id: 'sensory', label: 'Sensory Needs', icon: 'eye', color: '#26A69A' },
  { id: 'speech', label: 'Speech & Language', icon: 'chatbubble', color: '#42A5F5' },
  { id: 'physical', label: 'Physical/Motor', icon: 'accessibility', color: '#EC407A' },
  { id: 'social', label: 'SEMH', icon: 'heart', color: '#EF5350' },
  { id: 'cognition', label: 'Cognition & Learning', icon: 'bulb', color: '#FFA726' },
  { id: 'ela', label: 'EAL', icon: 'globe', color: '#66BB6A' },
  { id: 'hearing', label: 'Hearing Impairment', icon: 'ear', color: '#AB47BC' },
  { id: 'visual', label: 'Visual Impairment', icon: 'glasses', color: '#5C6BC0' },
  { id: 'general', label: 'General / Mixed', icon: 'people', color: '#78909C' },
];

const ABILITY_LEVELS = [
  { id: 'below', label: 'Below Expected', color: '#FF8A65' },
  { id: 'at', label: 'At Expected', color: '#66BB6A' },
  { id: 'above', label: 'Greater Depth', color: '#42A5F5' },
  { id: 'mixed', label: 'Mixed Ability', color: '#AB47BC' },
];

export default function DifferentiationWizard({
  visible,
  onClose,
  resourceType,
  title,
  description,
  instructions,
  materials,
  existingAdaptations,
}: DifferentiationWizardProps) {
  const [step, setStep] = useState<'select' | 'loading' | 'results'>('select');
  const [selectedSEN, setSelectedSEN] = useState<string | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<string>('mixed');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedSEN) return;
    setStep('loading');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('differentiate-activity', {
        body: {
          resourceType,
          title,
          description,
          instructions,
          materials,
          existingAdaptations,
          senType: selectedSEN,
          abilityLevel: selectedAbility,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setStep('results');
      } else {
        throw new Error('No suggestions returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate suggestions');
      setStep('select');
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedSEN(null);
    setSelectedAbility('mixed');
    setSuggestions(null);
    setError(null);
    onClose();
  };

  const senInfo = SEN_TYPES.find(s => s.id === selectedSEN);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="sparkles" size={20} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Differentiation Wizard</Text>
                <Text style={styles.headerSub}>AI-powered SEN adaptations</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {step === 'select' && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
              {/* Resource Info */}
              <View style={styles.resourceInfo}>
                <Ionicons name={resourceType === 'lesson' ? 'book' : 'color-palette'} size={18} color={COLORS.primary} />
                <Text style={styles.resourceTitle} numberOfLines={2}>{title}</Text>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* SEN Type Selection */}
              <Text style={styles.sectionLabel}>Select SEN Type</Text>
              <View style={styles.senGrid}>
                {SEN_TYPES.map((sen) => (
                  <TouchableOpacity
                    key={sen.id}
                    style={[
                      styles.senChip,
                      selectedSEN === sen.id && { backgroundColor: sen.color + '20', borderColor: sen.color },
                    ]}
                    onPress={() => setSelectedSEN(sen.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={sen.icon as any}
                      size={16}
                      color={selectedSEN === sen.id ? sen.color : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.senChipText,
                        selectedSEN === sen.id && { color: sen.color, fontWeight: '700' },
                      ]}
                    >
                      {sen.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ability Level */}
              <Text style={styles.sectionLabel}>Ability Level</Text>
              <View style={styles.abilityRow}>
                {ABILITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.abilityChip,
                      selectedAbility === level.id && { backgroundColor: level.color + '20', borderColor: level.color },
                    ]}
                    onPress={() => setSelectedAbility(level.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.abilityText,
                        selectedAbility === level.id && { color: level.color, fontWeight: '700' },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.generateBtn, !selectedSEN && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={!selectedSEN}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
                <Text style={styles.generateBtnText}>Generate Adaptations</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                AI-generated suggestions should be reviewed and adapted by the teacher based on individual pupil needs.
              </Text>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {step === 'loading' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.purple} />
              <Text style={styles.loadingTitle}>Generating Adaptations...</Text>
              <Text style={styles.loadingText}>
                Creating personalised differentiation suggestions for {senInfo?.label || 'SEN'} needs
              </Text>
            </View>
          )}

          {step === 'results' && suggestions && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
              {/* Overview */}
              <View style={[styles.resultCard, { borderLeftColor: senInfo?.color || COLORS.purple }]}>
                <View style={styles.resultCardHeader}>
                  <Ionicons name={senInfo?.icon as any || 'sparkles'} size={20} color={senInfo?.color || COLORS.purple} />
                  <Text style={styles.resultCardTitle}>{senInfo?.label} Adaptations</Text>
                </View>
                <Text style={styles.resultOverview}>{suggestions.overview}</Text>
              </View>

              {/* Environment Adaptations */}
              {suggestions.environmentAdaptations?.length > 0 && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="home" size={18} color={COLORS.primary} />
                    <Text style={styles.resultSectionTitle}>Environment</Text>
                  </View>
                  {suggestions.environmentAdaptations.map((item: any, i: number) => (
                    <View key={i} style={styles.adaptationItem}>
                      <View style={[styles.priorityDot, {
                        backgroundColor: item.priority === 'essential' ? COLORS.error
                          : item.priority === 'recommended' ? COLORS.warning : COLORS.info
                      }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.adaptationTitle}>{item.title}</Text>
                        <Text style={styles.adaptationDesc}>{item.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Activity Modifications */}
              {suggestions.activityModifications?.length > 0 && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="construct" size={18} color={COLORS.accentOrange} />
                    <Text style={styles.resultSectionTitle}>Activity Modifications</Text>
                  </View>
                  {suggestions.activityModifications.map((item: any, i: number) => (
                    <View key={i} style={styles.adaptationItem}>
                      <View style={[styles.priorityDot, {
                        backgroundColor: item.priority === 'essential' ? COLORS.error
                          : item.priority === 'recommended' ? COLORS.warning : COLORS.info
                      }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.adaptationTitle}>{item.title}</Text>
                        <Text style={styles.adaptationDesc}>{item.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Material Adaptations */}
              {suggestions.materialAdaptations?.length > 0 && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="cube" size={18} color={COLORS.secondary} />
                    <Text style={styles.resultSectionTitle}>Material Swaps</Text>
                  </View>
                  {suggestions.materialAdaptations.map((item: any, i: number) => (
                    <View key={i} style={styles.materialSwap}>
                      <View style={styles.materialSwapRow}>
                        <Text style={styles.materialOriginal}>{item.original}</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.secondary} />
                        <Text style={styles.materialAdapted}>{item.adapted}</Text>
                      </View>
                      <Text style={styles.materialReason}>{item.reason}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Communication Supports */}
              {suggestions.communicationSupports?.length > 0 && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="chatbubbles" size={18} color={COLORS.info} />
                    <Text style={styles.resultSectionTitle}>Communication</Text>
                  </View>
                  {suggestions.communicationSupports.map((item: string, i: number) => (
                    <View key={i} style={styles.bulletItem}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.info} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Timing & Staffing */}
              {(suggestions.timingNotes || suggestions.staffingNotes) && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="time" size={18} color={COLORS.purple} />
                    <Text style={styles.resultSectionTitle}>Practical Notes</Text>
                  </View>
                  {suggestions.timingNotes && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Timing:</Text>
                      <Text style={styles.noteText}>{suggestions.timingNotes}</Text>
                    </View>
                  )}
                  {suggestions.staffingNotes && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Staffing:</Text>
                      <Text style={styles.noteText}>{suggestions.staffingNotes}</Text>
                    </View>
                  )}
                  {suggestions.safetyConsiderations && (
                    <View style={[styles.noteBox, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.noteLabel, { color: COLORS.warning }]}>Safety:</Text>
                      <Text style={styles.noteText}>{suggestions.safetyConsiderations}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Extension Ideas */}
              {suggestions.extensionIdeas?.length > 0 && (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="rocket" size={18} color={COLORS.accent} />
                    <Text style={styles.resultSectionTitle}>Extension Ideas</Text>
                  </View>
                  {suggestions.extensionIdeas.map((item: string, i: number) => (
                    <View key={i} style={styles.bulletItem}>
                      <Ionicons name="star" size={16} color={COLORS.accent} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Back / Regenerate */}
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep('select')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>Change Options</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.regenerateBtn}
                  onPress={handleGenerate}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color={COLORS.white} />
                  <Text style={styles.regenerateBtnText}>Regenerate</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, maxHeight: '92%', minHeight: '50%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgPurple, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: SPACING.xl },
  resourceInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.lg },
  resourceTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#FFEBEE', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md },
  errorText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.error },
  sectionLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xl, marginBottom: SPACING.md },
  senGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  senChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  senChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '500' },
  abilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  abilityChip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lightGray },
  abilityText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '500' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.purple, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.xxl },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  disclaimer: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md, lineHeight: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.huge, minHeight: 300 },
  loadingTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  resultCard: { backgroundColor: COLORS.bgPurple, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg, borderLeftWidth: 4 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  resultCardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  resultOverview: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22 },
  resultSection: { marginTop: SPACING.xl },
  resultSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  resultSectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  adaptationItem: { flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.small },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  adaptationTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  adaptationDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: 2 },
  materialSwap: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.small },
  materialSwapRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  materialOriginal: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  materialAdapted: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.secondary },
  materialReason: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 4, fontStyle: 'italic' },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  noteBox: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  noteLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  noteText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  resultActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  backBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.bgLight, borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  backBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  regenerateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.purple },
  regenerateBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
});
