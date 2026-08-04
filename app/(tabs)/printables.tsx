import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { PRINTABLES } from '../data/printables';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import BrandedScreenHeader from '../components/BrandedScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadPrintable, downloadAllPrintables } from '../lib/printableGenerator';

const CATEGORY_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Worksheets', value: 'worksheet', icon: 'document-text' },
  { label: 'Posters', value: 'poster', icon: 'image' },
  { label: 'Cards', value: 'card', icon: 'albums' },
  { label: 'Checklists', value: 'checklist', icon: 'checkbox' },
  { label: 'Scripts', value: 'script', icon: 'reader' },
  { label: 'Displays', value: 'display', icon: 'easel' },
];

const AGE_FILTERS = [
  { label: 'All Ages', value: 'all' },
  { label: 'EYFS', value: 'EYFS' },
  { label: 'KS1', value: 'KS1' },
  { label: 'Both', value: 'Both' },
];

export default function PrintablesScreen() {
  const { toggleFavourite, isFavourite } = useAuth();
  const { showToast, showConfirm } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const visiblePrintables = useMemo(
    () => PRINTABLES.filter((printable) => printable.id !== 'p-10'),
    []
  );
  const categoryCount = useMemo(
    () => new Set(visiblePrintables.map((printable) => printable.category)).size,
    [visiblePrintables]
  );

  const filtered = useMemo(() => {
    return visiblePrintables.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesAge = ageFilter === 'all' || p.ageRange === ageFilter;
      return matchesSearch && matchesCategory && matchesAge;
    });
  }, [search, categoryFilter, ageFilter, visiblePrintables]);

  const handleDownload = async (printable: typeof PRINTABLES[0], format: string, variantId?: string) => {
    setDownloading(printable.id + format + (variantId ?? 'default'));
    try {
      const result = await downloadPrintable(printable, format, variantId);
      const variant = printable.variants?.find((item) => item.id === variantId) ?? printable.variants?.[0];
      const variantLabel = variant ? ` - ${variant.label}` : '';
      if (result.success) {
        if (result.method === 'tab') {
          showToast(
            'Printable Opened',
            `"${printable.title}"${variantLabel} (${format}) is open in a new tab. Use the "Print / Save as PDF" button to download it.`,
            'success'
          );
        } else if (result.method === 'file') {
          showToast(
            'File Downloaded',
            `"${printable.title}"${variantLabel} (${format}) has been downloaded as an HTML file. Open it in your browser, then use Print > Save as PDF.`,
            'success'
          );
        }
      } else {
        if (result.method === 'native') {
          showToast(
            'Web Only',
            'Printable downloads are available in the web version of this app.',
            'info'
          );
        } else {
          showToast(
            'Pop-up Blocked',
            'Please allow pop-ups for this site and try again.',
            'info'
          );
        }
      }
    } catch (error) {
      showToast('Download Error', 'Something went wrong. Please try again.', 'error');
    }
    setDownloading(null);
  };

  const handleDownloadAll = () => {
    showConfirm({
      title: 'Download All Resources',
      message: `Open all ${visiblePrintables.length} A4-first printable resources in a new tab? You can then print or save as PDF.`,
      confirmText: 'Open All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await downloadAllPrintables(visiblePrintables);
        if (result.success) {
          if (result.method === 'tab') {
            showToast('All Resources Opened', 'All printables are open in a new tab. Use "Print All / Save as PDF" to download.', 'success');
          } else {
            showToast('File Downloaded', 'All printables downloaded as an HTML file. Open it in your browser to print.', 'success');
          }
        } else {
          showToast('Pop-up Blocked', 'Please allow pop-ups for this site and try again.', 'info');
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandedScreenHeader
        title="Printables"
        subtitle="Official Many Petals classroom cards, posters, worksheets, and teacher sheets."
        icon="print"
        iconColor={COLORS.accentOrange}
        rightAction={(
          <TouchableOpacity style={styles.downloadAllBtn} onPress={handleDownloadAll} activeOpacity={0.7}>
            <Ionicons name="download" size={18} color={COLORS.white} />
            <Text style={styles.downloadAllText}>All</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={styles.section}>
          <View style={styles.overviewCard}>
            <Text style={styles.sectionEyebrow}>Print with confidence</Text>
            <Text style={styles.sectionTitle}>Open ready-to-use classroom resources that are designed to print cleanly and work fast</Text>
            <Text style={styles.sectionSubtitle}>
              Use these printables for lessons, displays, calm support, tracking, and parent communication without needing to remake anything yourself.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{filtered.length}</Text>
                <Text style={styles.statLabel}>showing now</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{visiblePrintables.length}</Text>
                <Text style={styles.statLabel}>classroom files</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{categoryCount}</Text>
                <Text style={styles.statLabel}>resource types</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.controlsCard}>
            <Text style={styles.controlsTitle}>Find the printable you need quickly</Text>
            <Text style={styles.controlsSubtitle}>
              Search by title, then narrow by resource type or age stage.
            </Text>

            <View style={styles.searchShell}>
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search printables..." />
            </View>

            <Text style={styles.filterLabel}>Filter by printable type</Text>
            <View style={styles.chipsShell}>
              <FilterChips chips={CATEGORY_FILTERS} selected={categoryFilter} onSelect={setCategoryFilter} />
            </View>

            <Text style={styles.filterLabel}>Filter by age stage</Text>
            <View style={styles.chipsShell}>
              <FilterChips chips={AGE_FILTERS} selected={ageFilter} onSelect={setAgeFilter} />
            </View>

            <Text style={styles.resultCount}>
              {filtered.length} resource{filtered.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>

        <View style={styles.section}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No printables found</Text>
          </View>
        ) : (
          filtered.map((printable) => {
            const favourited = isFavourite('printable', printable.id);
            const defaultVariant =
              printable.variants?.find((variant) => variant.id === printable.defaultVariantId) ??
              printable.variants?.[0] ?? {
                id: 'default',
                label: 'A4 classroom printable',
                helperText: 'Best for reliable 1-page classroom printing.',
                pages: printable.pages,
                formats: printable.formats,
                marginHint: 'Minimum margins' as const,
              };

            return (
              <View key={printable.id} style={[styles.card, { borderLeftColor: printable.color }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: printable.color + '20' }]}>
                    <Ionicons name={printable.icon as any} size={22} color={printable.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{printable.title}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.categoryBadge, { backgroundColor: printable.color + '15' }]}>
                        <Text style={[styles.categoryText, { color: printable.color }]}>
                          {printable.category}
                        </Text>
                      </View>
                      <Text style={styles.pages}>{defaultVariant.pages} page{defaultVariant.pages > 1 ? 's' : ''}</Text>
                      <Text style={styles.ageText}>{printable.ageRange}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFavourite('printable', printable.id)}
                    style={styles.favBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={favourited ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={favourited ? COLORS.accent : COLORS.mediumGray}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.description}>{printable.description}</Text>

                <View style={styles.variantList}>
                  <View style={styles.variantCard}>
                    <View style={styles.variantHeader}>
                      <View style={styles.variantTextWrap}>
                        <Text style={styles.variantTitle}>{defaultVariant.label}</Text>
                        <Text style={styles.variantHelper}>{defaultVariant.helperText}</Text>
                      </View>
                      <View style={styles.variantMetaWrap}>
                        <Text style={styles.variantMetaText}>
                          {defaultVariant.pages} page{defaultVariant.pages > 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.variantMetaText}>{defaultVariant.marginHint ?? 'Minimum margins'}</Text>
                      </View>
                    </View>

                    <View style={styles.formatRow}>
                      <Text style={styles.formatLabel}>Download:</Text>
                      {(defaultVariant.formats ?? printable.formats).map((format) => {
                        const isDownloading = downloading === printable.id + format + defaultVariant.id;
                        return (
                          <TouchableOpacity
                            key={defaultVariant.id + format}
                            style={[styles.formatButton, isDownloading && styles.formatButtonActive]}
                            onPress={() => handleDownload(printable, format, defaultVariant.id)}
                            disabled={isDownloading}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={isDownloading ? 'hourglass' : 'download-outline'}
                              size={14}
                              color={isDownloading ? COLORS.white : COLORS.primary}
                            />
                            <Text style={[styles.formatText, isDownloading && styles.formatTextActive]}>
                              {format}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  downloadAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round },
  downloadAllText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  container: { flex: 1 },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E3EDDA',
    ...SHADOWS.small,
  },
  sectionEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: '#8A6B1A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.accentOrange,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  controlsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E6EEF5',
    ...SHADOWS.small,
  },
  controlsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  controlsSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  searchShell: {
    marginTop: SPACING.md,
    marginHorizontal: -SPACING.lg,
  },
  filterLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  chipsShell: {
    marginHorizontal: -SPACING.lg,
    marginBottom: -SPACING.xs,
  },
  resultCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.huge },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textLight, marginTop: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10, borderLeftWidth: 4, ...SHADOWS.small },  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  categoryBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.round },
  categoryText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  pages: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  ageText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  favBtn: { padding: 6 },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: SPACING.md },
  variantList: { marginTop: SPACING.md, gap: SPACING.sm },
  variantCard: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: RADIUS.lg, padding: SPACING.md, backgroundColor: COLORS.bgLight },
  variantHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md, alignItems: 'flex-start' },
  variantTextWrap: { flex: 1 },
  variantTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  variantHelper: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: 4 },
  variantMetaWrap: { alignItems: 'flex-end', gap: 4 },
  variantMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  formatLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted },
  formatButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.primary + '10' },
  formatButtonActive: { backgroundColor: COLORS.primary },
  formatText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
  formatTextActive: { color: COLORS.white },
});
