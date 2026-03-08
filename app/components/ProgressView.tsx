import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import {
  MILESTONE_AREAS,
  RATING_LABELS,
  TERMS,
  getMilestonesForAgeGroup,
  getAreaAverage,
} from '../data/milestones';
import EmotionHistory from './EmotionHistory';
import type { EmotionLogEntry } from './EmotionHistory';

interface AssessmentData {
  milestone_id: string;
  area_id: string;
  rating: number;
  term: string;
  academic_year: string;
  assessed_at: string;
}

interface EmotionLogData {
  id: string;
  emotion_id: string;
  emotion_name: string;
  context: string;
  notes: string;
  logged_at: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  pupilCode: string;
  ageGroup: 'EYFS' | 'KS1';
  senStatus: boolean;
  assessments: AssessmentData[];
  emotionLogs?: EmotionLogData[];
  onDeleteEmotionLog?: (id: string) => void;
}

type ViewTab = 'milestones' | 'emotions';

export default function ProgressView({ visible, onClose, pupilCode, ageGroup, senStatus, assessments, emotionLogs = [], onDeleteEmotionLog }: Props) {
  const [selectedTerm, setSelectedTerm] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ViewTab>('milestones');
  const areas = getMilestonesForAgeGroup(ageGroup);

  // Group assessments by term
  const termGroups: Record<string, AssessmentData[]> = {};
  assessments.forEach(a => {
    const key = `${a.term} ${a.academic_year}`;
    if (!termGroups[key]) termGroups[key] = [];
    termGroups[key].push(a);
  });

  const termKeys = Object.keys(termGroups).sort();

  // Get latest assessments per milestone (for "all" view)
  const latestByMilestone: Record<string, AssessmentData> = {};
  assessments.forEach(a => {
    const existing = latestByMilestone[a.milestone_id];
    if (!existing || new Date(a.assessed_at) > new Date(existing.assessed_at)) {
      latestByMilestone[a.milestone_id] = a;
    }
  });

  const filteredAssessments = selectedTerm === 'all'
    ? Object.values(latestByMilestone)
    : (termGroups[selectedTerm] || []);

  // Calculate overall score
  const totalRated = filteredAssessments.length;
  const totalScore = filteredAssessments.reduce((s, a) => s + a.rating, 0);
  const avgRating = totalRated > 0 ? totalScore / totalRated : 0;
  const totalMilestones = areas.reduce((s, a) => s + a.milestones.length, 0);

  // Get rating label for average
  const getRatingLabel = (avg: number): { label: string; color: string } => {
    if (avg >= 3.5) return { label: 'Exceeding', color: RATING_LABELS[3].color };
    if (avg >= 2.5) return { label: 'Secure', color: RATING_LABELS[2].color };
    if (avg >= 1.5) return { label: 'Developing', color: RATING_LABELS[1].color };
    if (avg > 0) return { label: 'Emerging', color: RATING_LABELS[0].color };
    return { label: 'Not assessed', color: COLORS.mediumGray };
  };

  const overallLabel = getRatingLabel(avgRating);

  // Check for improvement between terms
  const getTermComparison = (areaId: string): { improved: boolean; change: number } | null => {
    if (termKeys.length < 2) return null;
    const prevTerm = termGroups[termKeys[termKeys.length - 2]] || [];
    const currTerm = termGroups[termKeys[termKeys.length - 1]] || [];
    
    const area = areas.find(a => a.id === areaId);
    if (!area) return null;

    const prevAvg = getAreaAverage(
      prevTerm.map(a => ({ milestone_id: a.milestone_id, rating: a.rating })),
      areaId
    );
    const currAvg = getAreaAverage(
      currTerm.map(a => ({ milestone_id: a.milestone_id, rating: a.rating })),
      areaId
    );

    if (prevAvg === 0 || currAvg === 0) return null;
    return { improved: currAvg > prevAvg, change: currAvg - prevAvg };
  };

  // Convert emotion logs to EmotionLogEntry format
  const emotionLogEntries: EmotionLogEntry[] = emotionLogs.map(l => ({
    id: l.id,
    emotion_id: l.emotion_id,
    emotion_name: l.emotion_name,
    context: l.context,
    notes: l.notes,
    logged_at: l.logged_at,
  }));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Progress: {pupilCode}</Text>
              <View style={styles.headerTags}>
                <View style={[styles.tag, { backgroundColor: COLORS.bgLight }]}>
                  <Text style={[styles.tagText, { color: COLORS.primary }]}>{ageGroup}</Text>
                </View>
                {senStatus ? (
                  <View style={[styles.tag, { backgroundColor: COLORS.bgPurple }]}>
                    <Text style={[styles.tagText, { color: COLORS.purple }]}>SEN</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'milestones' && styles.tabActive]}
              onPress={() => setActiveTab('milestones')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bar-chart"
                size={16}
                color={activeTab === 'milestones' ? COLORS.white : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'milestones' && styles.tabTextActive]}>
                Milestones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'emotions' && styles.tabActive]}
              onPress={() => setActiveTab('emotions')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="heart"
                size={16}
                color={activeTab === 'emotions' ? COLORS.white : COLORS.textLight}
              />
              <Text style={[styles.tabText, activeTab === 'emotions' && styles.tabTextActive]}>
                Emotions ({emotionLogs.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {activeTab === 'milestones' ? (
              <>
                {/* Overall Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryTop}>
                    <View style={[styles.summaryCircle, { borderColor: overallLabel.color }]}>
                      <Text style={[styles.summaryScore, { color: overallLabel.color }]}>
                        {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                      </Text>
                      <Text style={styles.summaryOutOf}>/4</Text>
                    </View>
                    <View style={styles.summaryInfo}>
                      <Text style={[styles.summaryLabel, { color: overallLabel.color }]}>
                        {overallLabel.label}
                      </Text>
                      <Text style={styles.summaryDetail}>
                        {totalRated} of {totalMilestones} milestones assessed
                      </Text>
                      {termKeys.length > 0 ? (
                        <Text style={styles.summaryDetail}>
                          {termKeys.length} term{termKeys.length !== 1 ? 's' : ''} of data
                        </Text>
                      ) : null}
                      {emotionLogs.length > 0 ? (
                        <Text style={[styles.summaryDetail, { color: COLORS.pink }]}>
                          {emotionLogs.length} emotion log{emotionLogs.length !== 1 ? 's' : ''} recorded
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Term Filter */}
                {termKeys.length > 0 ? (
                  <View style={styles.termFilter}>
                    <TouchableOpacity
                      style={[styles.termChip, selectedTerm === 'all' && styles.termChipActive]}
                      onPress={() => setSelectedTerm('all')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.termChipText, selectedTerm === 'all' && styles.termChipTextActive]}>
                        Latest
                      </Text>
                    </TouchableOpacity>
                    {termKeys.map(tk => (
                      <TouchableOpacity
                        key={tk}
                        style={[styles.termChip, selectedTerm === tk && styles.termChipActive]}
                        onPress={() => setSelectedTerm(tk)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.termChipText, selectedTerm === tk && styles.termChipTextActive]}>
                          {tk}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}

                {/* Area Breakdown */}
                {areas.map(area => {
                  const areaAssessments = filteredAssessments.filter(a => a.area_id === area.id);
                  const areaAvg = areaAssessments.length > 0
                    ? areaAssessments.reduce((s, a) => s + a.rating, 0) / areaAssessments.length
                    : 0;
                  const areaLabel = getRatingLabel(areaAvg);
                  const comparison = getTermComparison(area.id);

                  return (
                    <View key={area.id} style={styles.areaCard}>
                      <View style={styles.areaHeader}>
                        <View style={[styles.areaIcon, { backgroundColor: area.bgColor }]}>
                          <Ionicons name={area.icon as any} size={18} color={area.color} />
                        </View>
                        <View style={styles.areaInfo}>
                          <Text style={styles.areaTitle}>{area.title}</Text>
                          <Text style={styles.areaSrc}>{area.source}</Text>
                        </View>
                        <View style={styles.areaScoreBox}>
                          <Text style={[styles.areaScore, { color: areaLabel.color }]}>
                            {areaAvg > 0 ? areaAvg.toFixed(1) : '-'}
                          </Text>
                          {comparison ? (
                            <View style={styles.changeRow}>
                              <Ionicons
                                name={comparison.improved ? 'trending-up' : 'trending-down'}
                                size={14}
                                color={comparison.improved ? COLORS.success : COLORS.warning}
                              />
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {/* Visual bar chart for each milestone */}
                      <View style={styles.milestonesList}>
                        {area.milestones.map(m => {
                          const assessment = areaAssessments.find(a => a.milestone_id === m.id);
                          const rating = assessment?.rating || 0;
                          const ratingInfo = rating > 0 ? RATING_LABELS[rating - 1] : null;

                          return (
                            <View key={m.id} style={styles.milestoneItem}>
                              <Text style={styles.mLabel} numberOfLines={1}>{m.shortLabel}</Text>
                              <View style={styles.barContainer}>
                                <View style={styles.barBg}>
                                  {rating > 0 ? (
                                    <View
                                      style={[
                                        styles.barFill,
                                        {
                                          width: `${(rating / 4) * 100}%`,
                                          backgroundColor: ratingInfo?.color || COLORS.mediumGray,
                                        },
                                      ]}
                                    />
                                  ) : null}
                                </View>
                                <Text style={[styles.mRating, { color: ratingInfo?.color || COLORS.textMuted }]}>
                                  {ratingInfo ? ratingInfo.shortLabel : '--'}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                {/* Term-over-term comparison */}
                {termKeys.length >= 2 ? (
                  <View style={styles.comparisonCard}>
                    <View style={styles.compHeader}>
                      <Ionicons name="analytics" size={20} color={COLORS.primary} />
                      <Text style={styles.compTitle}>Term-over-Term Progress</Text>
                    </View>
                    {areas.map(area => {
                      const comparison = getTermComparison(area.id);
                      if (!comparison) return null;
                      return (
                        <View key={area.id} style={styles.compRow}>
                          <View style={[styles.compDot, { backgroundColor: area.color }]} />
                          <Text style={styles.compAreaName}>{area.shortTitle}</Text>
                          <View style={styles.compChange}>
                            <Ionicons
                              name={comparison.improved ? 'arrow-up-circle' : comparison.change === 0 ? 'remove-circle' : 'arrow-down-circle'}
                              size={18}
                              color={comparison.improved ? COLORS.success : comparison.change === 0 ? COLORS.mediumGray : COLORS.warning}
                            />
                            <Text style={[
                              styles.compChangeText,
                              { color: comparison.improved ? COLORS.success : comparison.change === 0 ? COLORS.mediumGray : COLORS.warning },
                            ]}>
                              {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(1)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {/* Empty state */}
                {assessments.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="bar-chart-outline" size={48} color={COLORS.mediumGray} />
                    <Text style={styles.emptyTitle}>No assessments yet</Text>
                    <Text style={styles.emptyText}>
                      Tap "Quick Assess" to record this pupil's first milestone ratings.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              /* Emotions Tab */
              <View style={styles.emotionsTab}>
                <EmotionHistory
                  logs={emotionLogEntries}
                  onDelete={onDeleteEmotionLog}
                  showDelete={true}
                  maxItems={20}
                />
              </View>
            )}

            <View style={{ height: 40 }} />
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
    backgroundColor: COLORS.bgLight,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '95%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerTags: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  summaryCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryScore: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  summaryOutOf: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: -2,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  summaryDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  termFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  termChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  termChipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  termChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  termChipTextActive: {
    color: COLORS.primary,
  },
  areaCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  areaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaInfo: {
    flex: 1,
  },
  areaTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  areaSrc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  areaScoreBox: {
    alignItems: 'center',
  },
  areaScore: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  milestonesList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mLabel: {
    width: 100,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  barBg: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  mRating: {
    width: 22,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  compHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  compTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '60',
  },
  compDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  compAreaName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  compChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compChangeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  // Emotions tab
  emotionsTab: {
    paddingTop: SPACING.sm,
  },
});
