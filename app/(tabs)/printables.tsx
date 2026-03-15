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

  const filtered = useMemo(() => {
    return PRINTABLES.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesAge = ageFilter === 'all' || p.ageRange === ageFilter;
      return matchesSearch && matchesCategory && matchesAge;
    });
  }, [search, categoryFilter, ageFilter]);

  const handleDownload = async (printable: typeof PRINTABLES[0], format: string) => {
    setDownloading(printable.id + format);
    try {
      const result = await downloadPrintable(printable, format);
      if (result.success) {
        if (result.method === 'tab') {
          showToast(
            'Printable Opened',
            `"${printable.title}" (${format}) is open in a new tab. Use the "Print / Save as PDF" button to download it.`,
            'success'
          );
        } else if (result.method === 'file') {
          showToast(
            'File Downloaded',
            `"${printable.title}" (${format}) has been downloaded as an HTML file. Open it in your browser, then use Print > Save as PDF.`,
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
      message: `Open all ${PRINTABLES.length} printable resources in a new tab? You can then print or save as PDF.`,
      confirmText: 'Open All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await downloadAllPrintables(PRINTABLES);
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="print" size={24} color={COLORS.accentOrange} />
          <Text style={styles.headerTitle}>Printables</Text>
        </View>
        <TouchableOpacity style={styles.downloadAllBtn} onPress={handleDownloadAll} activeOpacity={0.7}>
          <Ionicons name="download" size={18} color={COLORS.white} />
          <Text style={styles.downloadAllText}>All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 6 }}>
  <SearchBar value={search} onChangeText={setSearch} placeholder="Search printables..." />
</View>
<View style={{ marginBottom: 4 }}>
  <FilterChips chips={CATEGORY_FILTERS} selected={categoryFilter} onSelect={setCategoryFilter} />
</View>
<View style={{ marginBottom: 6 }}>
  <FilterChips chips={AGE_FILTERS} selected={ageFilter} onSelect={setAgeFilter} />
</View>

      <Text style={styles.resultCount}>
        {filtered.length} resource{filtered.length !== 1 ? 's' : ''} found
      </Text>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No printables found</Text>
          </View>
        ) : (
          filtered.map((printable) => {
            const favourited = isFavourite('printable', printable.id);
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
                      <Text style={styles.pages}>{printable.pages} page{printable.pages > 1 ? 's' : ''}</Text>
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

                <View style={styles.formatRow}>
                  <Text style={styles.formatLabel}>Download:</Text>
                  {printable.formats.map((format) => {
                    const isDownloading = downloading === printable.id + format;
                    return (
                      <TouchableOpacity
                        key={format}
                        style={[styles.formatButton, isDownloading && styles.formatButtonActive]}
                        onPress={() => handleDownload(printable, format)}
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
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  downloadAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round },
  downloadAllText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  resultCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  container: { flex: 1, paddingHorizontal: SPACING.lg },
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
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  formatLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted },
  formatButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.primary + '10' },
  formatButtonActive: { backgroundColor: COLORS.primary },
  formatText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
  formatTextActive: { color: COLORS.white },
});
