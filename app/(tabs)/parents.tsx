import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { PARENT_LETTERS, ParentLetter } from '../data/parentLetters';
import { downloadParentLetter, downloadAllParentLetters } from '../lib/parentLetterGenerator';
import { useToast } from '../context/ToastContext';

const CATEGORY_ICONS: Record<string, string> = {
  letter: 'mail',
  sheet: 'document-text',
  questionnaire: 'clipboard',
  report: 'bar-chart',
};

const CATEGORY_LABELS: Record<string, string> = {
  letter: 'Letter',
  sheet: 'Activity Sheet',
  questionnaire: 'Questionnaire',
  report: 'Report Template',
};

export default function ParentCommunicationScreen() {
  const { showToast, showConfirm } = useToast();
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewLetter, setPreviewLetter] = useState<ParentLetter | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleDownload = useCallback(async (letter: ParentLetter) => {
    setDownloading(letter.id);
    try {
      const result = await downloadParentLetter(letter, schoolName, teacherName);
      if (result.success) {
        if (result.method === 'tab') {
          showToast(
            'Document Opened',
            `"${letter.title}" is open in a new tab. Use "Print / Save as PDF" to download.`,
            'success'
          );
        } else if (result.method === 'file') {
          showToast(
            'File Downloaded',
            `"${letter.title}" has been downloaded. Open in your browser to print.`,
            'success'
          );
        }
      } else {
        if (result.method === 'native') {
          showToast('Web Only', 'Document downloads are available in the web version.', 'info');
        } else {
          showToast('Pop-up Blocked', 'Please allow pop-ups for this site and try again.', 'info');
        }
      }
    } catch {
      showToast('Download Error', 'Something went wrong. Please try again.', 'error');
    }
    setDownloading(null);
  }, [schoolName, teacherName, showToast]);

  const handleDownloadAll = useCallback(() => {
    showConfirm({
      title: 'Download All Letters',
      message: `Open all ${PARENT_LETTERS.length} parent communication documents in a new tab with your school and teacher details? You can then print or save as PDF.`,
      confirmText: 'Open All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await downloadAllParentLetters(PARENT_LETTERS, schoolName, teacherName);
        if (result.success) {
          if (result.method === 'tab') {
            showToast('Pack Opened', 'All parent letters are open in a new tab. Use "Print All" to download.', 'success');
          } else {
            showToast('File Downloaded', 'Parent communication pack downloaded. Open in your browser to print.', 'success');
          }
        } else {
          showToast('Pop-up Blocked', 'Please allow pop-ups for this site and try again.', 'info');
        }
      },
    });
  }, [schoolName, teacherName, showToast, showConfirm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="people" size={22} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Parent Communication</Text>
            <Text style={styles.headerSub}>Letters, sheets &amp; templates</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.downloadAllBtn}
            onPress={handleDownloadAll}
            activeOpacity={0.7}
          >
            <Ionicons name="download" size={16} color={COLORS.white} />
            <Text style={styles.downloadAllText}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Personalisation Banner */}
        <View style={styles.personaliseBanner}>
          <View style={styles.personaliseIcon}>
            <Ionicons name="school" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.personaliseContent}>
            <Text style={styles.personaliseTitle}>Personalise Your Documents</Text>
            <Text style={styles.personaliseDesc}>
              Add your school and teacher name below. These details will appear on all downloaded letters and templates.
            </Text>
          </View>
        </View>

        {/* Editable Fields */}
        <View style={styles.fieldsCard}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="business" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>School Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={schoolName}
                onChangeText={setSchoolName}
                placeholder="e.g. Oakwood Primary School"
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Teacher Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={teacherName}
                onChangeText={setTeacherName}
                placeholder="e.g. Mrs. Smith"
                placeholderTextColor={COLORS.mediumGray}
              />
            </View>
          </View>
          {(schoolName || teacherName) ? (
            <View style={styles.previewBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.previewBadgeText}>
                Documents will include: {[schoolName, teacherName].filter(Boolean).join(' / ')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Documents</Text>
          <Text style={styles.sectionCount}>{PARENT_LETTERS.length} templates</Text>
        </View>

        {/* Letter Cards */}
        {PARENT_LETTERS.map((letter) => {
          const isDownloading = downloading === letter.id;
          return (
            <View key={letter.id} style={[styles.letterCard, { borderLeftColor: letter.color }]}>
              {/* Card Header */}
              <View style={styles.letterHeader}>
                <View style={[styles.letterIconCircle, { backgroundColor: letter.color + '18' }]}>
                  <Ionicons name={letter.icon as any} size={24} color={letter.color} />
                </View>
                <View style={styles.letterInfo}>
                  <Text style={styles.letterTitle}>{letter.title}</Text>
                  <View style={styles.letterMeta}>
                    <View style={[styles.categoryChip, { backgroundColor: letter.color + '12' }]}>
                      <Ionicons
                        name={CATEGORY_ICONS[letter.category] as any}
                        size={12}
                        color={letter.color}
                      />
                      <Text style={[styles.categoryChipText, { color: letter.color }]}>
                        {CATEGORY_LABELS[letter.category]}
                      </Text>
                    </View>
                    <Text style={styles.pageCount}>
                      {letter.pages} page{letter.pages > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Subtitle */}
              <Text style={[styles.letterSubtitle, { color: letter.color }]}>
                {letter.subtitle}
              </Text>

              {/* Description */}
              <Text style={styles.letterDesc}>{letter.description}</Text>

              {/* Actions */}
              <View style={styles.letterActions}>
                <TouchableOpacity
                  style={styles.previewBtn}
                  onPress={() => setPreviewLetter(letter)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.previewBtnText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.downloadBtn, { backgroundColor: letter.color }, isDownloading && styles.downloadBtnDisabled]}
                  onPress={() => handleDownload(letter)}
                  disabled={isDownloading}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isDownloading ? 'hourglass' : 'download-outline'}
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.downloadBtnText}>
                    {isDownloading ? 'Opening...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.accent} />
            <Text style={styles.tipsTitle}>Tips for Parent Communication</Text>
          </View>
          <View style={styles.tipsList}>
            {[
              { icon: 'time-outline', text: 'Send the introduction letter at the start of the programme to set expectations' },
              { icon: 'home-outline', text: 'Share the home activities sheet after the first few lessons when children are familiar with the concepts' },
              { icon: 'clipboard-outline', text: 'Send the sensory questionnaire early and allow 1-2 weeks for return' },
              { icon: 'calendar-outline', text: 'Use the progress report at the end of each half-term or as needed for individual children' },
              { icon: 'chatbubbles-outline', text: 'Personalise documents with your school and name for a professional touch' },
              { icon: 'print-outline', text: 'All documents are A4-ready \u2013 use "Print / Save as PDF" for best results' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name={tip.icon as any} size={16} color={COLORS.primary} />
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.infoFooterText}>
            All documents are designed to be printed on A4 paper. For best results, use the "Print / Save as PDF" button in the opened document. Documents open in a new browser tab.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Preview Modal */}
      {previewLetter && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={[styles.modalIconCircle, { backgroundColor: previewLetter.color + '18' }]}>
                    <Ionicons name={previewLetter.icon as any} size={22} color={previewLetter.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{previewLetter.title}</Text>
                    <Text style={[styles.modalSubtitle, { color: previewLetter.color }]}>
                      {previewLetter.subtitle}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setPreviewLetter(null)} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Document Info */}
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="document-text" size={16} color={COLORS.textMuted} />
                    <Text style={styles.modalInfoText}>
                      {CATEGORY_LABELS[previewLetter.category]} &bull; {previewLetter.pages} page{previewLetter.pages > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="print" size={16} color={COLORS.textMuted} />
                    <Text style={styles.modalInfoText}>A4 format, ready to print or save as PDF</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="create" size={16} color={COLORS.textMuted} />
                    <Text style={styles.modalInfoText}>
                      {schoolName || teacherName
                        ? `Personalised with: ${[schoolName, teacherName].filter(Boolean).join(', ')}`
                        : 'Add your school and teacher name above to personalise'}
                    </Text>
                  </View>
                </View>

                {/* What's Included */}
                <Text style={styles.modalSectionTitle}>What&apos;s Included</Text>
                <Text style={styles.modalDesc}>{previewLetter.description}</Text>

                {/* Content Preview by Type */}
                {previewLetter.id === 'pl-1' && (
                  <View style={styles.contentPreview}>
                    <Text style={styles.modalSectionTitle}>Letter Covers</Text>
                    {[
                      'Introduction to the Cobie emotional literacy programme',
                      'What the programme covers and why it matters',
                      'What activities children will take part in',
                      'How parents can support learning at home',
                      'Contact details and next steps',
                    ].map((item, i) => (
                      <View key={i} style={styles.previewItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.previewItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {previewLetter.id === 'pl-2' && (
                  <View style={styles.contentPreview}>
                    <Text style={styles.modalSectionTitle}>Activity Categories</Text>
                    {[
                      'Talking About Feelings \u2013 emotion check-ins, drawing, story discussions',
                      'Calming Strategies \u2013 balloon breathing, calm down jar, grounding',
                      'Sensory Exploration \u2013 texture hunts, listening walks',
                      'Kindness & Empathy \u2013 kindness jar, compliment circles',
                      '10 practical activities with age ranges and materials lists',
                    ].map((item, i) => (
                      <View key={i} style={styles.previewItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.previewItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {previewLetter.id === 'pl-3' && (
                  <View style={styles.contentPreview}>
                    <Text style={styles.modalSectionTitle}>Questionnaire Sections</Text>
                    {[
                      'Sight (Visual) \u2013 light sensitivity, colour preferences, visual clutter',
                      'Sound (Auditory) \u2013 noise tolerance, soothing/distressing sounds',
                      'Touch (Tactile) \u2013 texture preferences, clothing, physical contact',
                      'Taste & Smell \u2013 food preferences, smell sensitivities',
                      'Movement & Body Awareness \u2013 activity levels, sitting tolerance',
                      'General Wellbeing \u2013 calming strategies, additional needs',
                    ].map((item, i) => (
                      <View key={i} style={styles.previewItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.previewItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {previewLetter.id === 'pl-4' && (
                  <View style={styles.contentPreview}>
                    <Text style={styles.modalSectionTitle}>Report Sections</Text>
                    {[
                      'Progress ratings across 6 key areas (1\u20134 scale)',
                      'Key Strengths \u2013 space for personalised observations',
                      'Areas for Development \u2013 next steps for the child',
                      'Strategies Used in School \u2013 checklist of interventions',
                      'Suggestions for Home \u2013 activities parents can try',
                      'Emotional Check-In Summary \u2013 emotion frequency data',
                      'Signature areas for teacher and parent/carer',
                    ].map((item, i) => (
                      <View key={i} style={styles.previewItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.previewItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setPreviewLetter(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalDownloadBtn, { backgroundColor: previewLetter.color }]}
                  onPress={() => {
                    setPreviewLetter(null);
                    handleDownload(previewLetter);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="download-outline" size={18} color={COLORS.white} />
                  <Text style={styles.modalDownloadText}>Download Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: 400 }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Ionicons name="settings" size={22} color={COLORS.primary} />
                  <Text style={[styles.modalTitle, { marginLeft: 8 }]}>Document Settings</Text>
                </View>
                <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: SPACING.lg }}>
                <Text style={styles.settingsLabel}>School Name</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="Enter your school name"
                  placeholderTextColor={COLORS.mediumGray}
                />

                <Text style={[styles.settingsLabel, { marginTop: SPACING.lg }]}>Teacher Name</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={teacherName}
                  onChangeText={setTeacherName}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.mediumGray}
                />

                <View style={styles.settingsNote}>
                  <Ionicons name="information-circle" size={16} color={COLORS.info} />
                  <Text style={styles.settingsNoteText}>
                    These details will be included in all downloaded documents. You can change them at any time.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalDownloadBtn, { backgroundColor: COLORS.primary, flex: 1 }]}
                  onPress={() => setShowSettings(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  <Text style={styles.modalDownloadText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  downloadAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  downloadAllText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },

  container: { flex: 1, paddingHorizontal: SPACING.lg },

  // Personalise Banner
  personaliseBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    gap: SPACING.md,
  },
  personaliseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaliseContent: { flex: 1 },
  personaliseTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  personaliseDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: 2 },

  // Fields Card
  fieldsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted, marginBottom: 2 },
  fieldInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    paddingVertical: Platform.OS === 'web' ? 6 : 4,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.lightGray,
  },
  fieldDivider: { height: 1, backgroundColor: COLORS.lightGray, marginVertical: SPACING.md },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  previewBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '600' },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

  // Letter Cards
  letterCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  letterHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  letterIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterInfo: { flex: 1 },
  letterTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  letterMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  categoryChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  pageCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  letterSubtitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: SPACING.sm },
  letterDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  letterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  previewBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    flex: 1,
    justifyContent: 'center',
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.bgWarm,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  tipsTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  tipsList: { gap: SPACING.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, flex: 1 },

  // Info Footer
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  infoFooterText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, lineHeight: 18, flex: 1 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    maxWidth: 520,
    width: '100%',
    maxHeight: '85%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  modalIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalSubtitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: 2 },
  modalClose: { padding: 4 },
  modalBody: { padding: SPACING.lg },
  modalInfoCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  modalInfoText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, flex: 1 },
  modalSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginBottom: SPACING.md },
  contentPreview: { marginTop: SPACING.sm },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  previewItemText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, flex: 1 },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  modalCancelBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textLight },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    flex: 1,
  },
  modalDownloadText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },

  // Settings Modal
  settingsLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: 4 },
  settingsInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgLight,
  },
  settingsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#E3F2FD',
    borderRadius: RADIUS.md,
  },
  settingsNoteText: { fontSize: FONT_SIZES.xs, color: COLORS.info, lineHeight: 18, flex: 1 },
});
