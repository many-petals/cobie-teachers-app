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
      <View style={styles.header}>
        <Ionicons name="color-palette" size={24} color={COLORS.secondary} />
        <Text style={styles.headerTitle}>Optional Activities</Text>
      </View>
      <SENBanner />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search activities..." />
      <FilterChips chips={SKILL_FILTERS} selected={skillFilter} onSelect={setSkillFilter} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  container: { flex: 1, paddingHorizontal: SPACING.lg },
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
