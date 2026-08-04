import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { ACTIVITIES } from '../data/activities';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import SENBanner from '../components/SENBanner';
import BrandedScreenHeader from '../components/BrandedScreenHeader';
import { useSEN } from '../context/SENContext';
import { useAuth } from '../context/AuthContext';

const SKILL_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Sensory', value: 'sensory', icon: 'eye', color: COLORS.sensory },
  { label: 'Emotional', value: 'emotional', icon: 'heart', color: COLORS.emotional },
  { label: 'Communication', value: 'communication', icon: 'chatbubbles', color: COLORS.communication },
  { label: 'Creative', value: 'creative', icon: 'color-palette', color: COLORS.creative },
  { label: 'Movement', value: 'movement', icon: 'body', color: COLORS.movement },
  { label: 'Reflection', value: 'reflection', icon: 'leaf', color: COLORS.reflection },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const { senMode } = useSEN();
  const { toggleFavourite, isFavourite } = useAuth();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const skillTypeCount = useMemo(
    () => new Set(ACTIVITIES.map((activity) => activity.skillType)).size,
    []
  );

  const filtered = useMemo(() => {
    return ACTIVITIES.filter((a) => {
      const matchesSearch =
        search === '' ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.purpose.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'all' || a.skillType === skillFilter;
      return matchesSearch && matchesSkill;
    });
  }, [search, skillFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandedScreenHeader
        title="Optional Activities"
        subtitle="Short follow-up ideas for circle time, regulation support, and lesson extension."
        icon="color-palette"
        iconColor={COLORS.secondary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={styles.section}>
          <View style={styles.overviewCard}>
            <Text style={styles.sectionEyebrow}>Use when needed</Text>
            <Text style={styles.sectionTitle}>Pick a short follow-up activity that supports the lesson, the moment, or the child</Text>
            <Text style={styles.sectionSubtitle}>
              These quick activities are designed to help you extend learning, settle the room, and respond without needing to plan something new from scratch.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{filtered.length}</Text>
                <Text style={styles.statLabel}>showing now</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{ACTIVITIES.length}</Text>
                <Text style={styles.statLabel}>total activities</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{skillTypeCount}</Text>
                <Text style={styles.statLabel}>skill types</Text>
              </View>
            </View>

            <View style={styles.senWrap}>
              <SENBanner compact />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.controlsCard}>
            <Text style={styles.controlsTitle}>Find the right activity quickly</Text>
            <Text style={styles.controlsSubtitle}>
              Search by title or choose the skill area you want to reinforce.
            </Text>

            <View style={styles.searchShell}>
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search activities..." />
            </View>

            <Text style={styles.filterLabel}>Filter by activity type</Text>
            <View style={styles.chipsShell}>
              <FilterChips chips={SKILL_FILTERS} selected={skillFilter} onSelect={setSkillFilter} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filtered.map((activity) => {
            const favourited = isFavourite('activity', activity.id);
            return (
              <TouchableOpacity
                key={activity.id}
                style={[styles.activityCard, { borderLeftColor: activity.color }]}
                onPress={() => router.push(`/activity/${activity.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconCircle, { backgroundColor: activity.color + '20' }]}>
                    <Ionicons name={activity.icon as any} size={24} color={activity.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.activityTitle, senMode && styles.senTitle]}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityType}>{activity.type}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      toggleFavourite('activity', activity.id);
                    }}
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

                <Text style={styles.purpose} numberOfLines={senMode ? 3 : 2}>
                  {activity.purpose}
                </Text>

                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{activity.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="school-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{activity.ageRange}</Text>
                  </View>
                  <View style={[styles.skillBadge, { backgroundColor: activity.color + '15' }]}>
                    <Text style={[styles.skillText, { color: activity.color }]}>
                      {activity.skillType}
                    </Text>
                  </View>
                </View>

                {senMode && activity.senAdaptations.length > 0 && (
                  <View style={styles.senAdaptations}>
                    <Ionicons name="accessibility" size={14} color={COLORS.purple} />
                    <Text style={styles.senText}>
                      SEN: {activity.senAdaptations[0]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
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
    color: '#5F7B4D',
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
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  senWrap: {
    marginTop: SPACING.lg,
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
  emptyState: { alignItems: 'center', paddingVertical: SPACING.huge },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textLight, marginTop: SPACING.md },
  emptySubtext: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  activityCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 4, ...SHADOWS.small },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  activityTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  senTitle: { fontSize: FONT_SIZES.lg },
  activityType: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  favBtn: { padding: 6 },
  purpose: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: SPACING.md },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  skillBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.round },
  skillText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  senAdaptations: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm, backgroundColor: COLORS.bgPurple, padding: SPACING.sm, borderRadius: RADIUS.md },
  senText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '500' },
});
