import React, { useState, useEffect } from 'react';
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
  getCurrentAcademicYear,
  getCurrentTerm,
  getMilestonesForAgeGroup,
} from '../data/milestones';
import { useSEN } from '../context/SENContext';

interface Assessment {
  milestone_id: string;
  area_id: string;
  rating: number;
}

interface ExistingAssessment {
  milestone_id: string;
  area_id: string;
  rating: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (assessments: Assessment[], term: string, academicYear: string) => void;
  pupilCode: string;
  ageGroup: 'EYFS' | 'KS1';
  existingAssessments: ExistingAssessment[];
}

const ASSESSMENT_CHOICES = [
  { value: 1, label: 'Needs support', shortLabel: 'Support' },
  { value: 2, label: 'Building', shortLabel: 'Building' },
  { value: 3, label: 'On track', shortLabel: 'On track' },
];

const QUICK_RATING_LABELS = RATING_LABELS.filter(r => r.value <= 3);

export default function QuickAssess({ visible, onClose, onSave, pupilCode, ageGroup, existingAssessments }: Props) {
  const { senMode } = useSEN();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [term, setTerm] = useState(getCurrentTerm());
  const [academicYear] = useState(getCurrentAcademicYear());
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const areas = getMilestonesForAgeGroup(ageGroup);

  // Initialize with existing assessments
  useEffect(() => {
    if (visible) {
      const existing: Record<string, number> = {};
      existingAssessments.forEach(a => {
        existing[a.milestone_id] = a.rating;
      });
      setRatings(existing);
      // Auto-expand first area
      if (areas.length > 0 && !expandedArea) {
        setExpandedArea(areas[0].id);
      }
    }
  }, [visible, existingAssessments]);

  const setRating = (milestoneId: string, rating: number) => {
    setRatings(prev => {
      // Toggle off if same rating tapped
      if (prev[milestoneId] === rating) {
        const next = { ...prev };
        delete next[milestoneId];
        return next;
      }
      return { ...prev, [milestoneId]: rating };
    });
  };

  const setAreaRating = (areaId: string, rating: number) => {
    const targetArea = areas.find(area => area.id === areaId);
    if (!targetArea) return;

    setRatings(prev => {
      const next = { ...prev };
      targetArea.milestones.forEach(milestone => {
        next[milestone.id] = rating;
      });
      return next;
    });
    setExpandedArea(areaId);
  };

  const setAllRatings = (rating: number) => {
    setRatings(() => {
      const next: Record<string, number> = {};
      areas.forEach(area => {
        area.milestones.forEach(milestone => {
          next[milestone.id] = rating;
        });
      });
      return next;
    });
  };

  const clearRatings = () => {
    setRatings({});
  };

  const handleSave = () => {
    const assessments: Assessment[] = [];
    areas.forEach(area => {
      area.milestones.forEach(m => {
        if (ratings[m.id]) {
          assessments.push({
            milestone_id: m.id,
            area_id: area.id,
            rating: ratings[m.id],
          });
        }
      });
    });
    onSave(assessments, term, academicYear);
    onClose();
  };

  const ratedCount = Object.keys(ratings).length;
  const totalMilestones = areas.reduce((sum, a) => sum + a.milestones.length, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Quick Assess</Text>
              <Text style={styles.headerSub}>{pupilCode} - {ageGroup} - {term} {academicYear}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Term Selector */}
          <View style={styles.termRow}>
            {TERMS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.termBtn, term === t && styles.termBtnActive]}
                onPress={() => setTerm(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.termText, term === t && styles.termTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Key */}
          <View style={styles.ratingKey}>
            {QUICK_RATING_LABELS.map(r => (
              <View key={r.value} style={[styles.keyItem, { backgroundColor: r.bgColor }]}>
                <View style={[styles.keyDot, { backgroundColor: r.color }]}>
                  <Text style={styles.keyDotText}>{r.shortLabel}</Text>
                </View>
                <Text style={[styles.keyLabel, { color: r.color }]}>
                  {ASSESSMENT_CHOICES.find(choice => choice.value === r.value)?.label ?? r.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${totalMilestones > 0 ? (ratedCount / totalMilestones) * 100 : 0}%` }]} />
          </View>
          <Text style={styles.progressText}>{ratedCount} of {totalMilestones} milestones rated</Text>

          {/* Milestone Areas */}
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={true}>
            <View style={styles.quickStartCard}>
              <View style={styles.quickStartTitleRow}>
                <Ionicons name="flash" size={18} color={COLORS.secondary} />
                <Text style={styles.quickStartTitle}>Fast route</Text>
              </View>
              <Text style={styles.quickStartCopy}>
                Choose one level for each area, then open an area only if you need to tweak individual milestones.
              </Text>
              <View style={styles.quickFillRow}>
                {QUICK_RATING_LABELS.map(r => {
                  const choice = ASSESSMENT_CHOICES.find(c => c.value === r.value);
                  return (
                    <TouchableOpacity
                      key={r.value}
                      style={[styles.quickFillBtn, { borderColor: r.color, backgroundColor: r.bgColor }]}
                      onPress={() => setAllRatings(r.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.quickFillText, { color: r.color }]}>
                        All {choice?.shortLabel ?? r.shortLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.clearBtn} onPress={clearRatings} activeOpacity={0.7}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {areas.map(area => {
              const isExpanded = expandedArea === area.id;
              const areaRated = area.milestones.filter(m => ratings[m.id]).length;

              return (
                <View key={area.id} style={styles.areaCard}>
                  <TouchableOpacity
                    style={styles.areaHeader}
                    onPress={() => setExpandedArea(isExpanded ? null : area.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.areaIcon, { backgroundColor: area.bgColor }]}>
                      <Ionicons name={area.icon as any} size={20} color={area.color} />
                    </View>
                    <View style={styles.areaInfo}>
                      <Text style={styles.areaTitle}>{senMode ? area.shortTitle : area.title}</Text>
                      <Text style={styles.areaSub}>{areaRated}/{area.milestones.length} rated - tap a level below to fill this area</Text>
                    </View>
                    {/* Mini progress dots */}
                    <View style={styles.miniDots}>
                      {area.milestones.map(m => {
                        const r = ratings[m.id];
                        const ratingInfo = r ? RATING_LABELS.find(rl => rl.value === r) : null;
                        return (
                          <View
                            key={m.id}
                            style={[
                              styles.miniDot,
                              { backgroundColor: ratingInfo ? ratingInfo.color : COLORS.lightGray },
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.mediumGray}
                    />
                  </TouchableOpacity>

                  <View style={styles.areaQuickRow}>
                    {QUICK_RATING_LABELS.map(r => {
                      const choice = ASSESSMENT_CHOICES.find(c => c.value === r.value);
                      return (
                        <TouchableOpacity
                          key={r.value}
                          style={[styles.areaQuickBtn, { borderColor: r.color }]}
                          onPress={() => setAreaRating(area.id, r.value)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.areaQuickText, { color: r.color }]}>
                            {choice?.shortLabel ?? r.shortLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {isExpanded && (
                    <View style={styles.milestonesContainer}>
                      {area.milestones.map(milestone => {
                        const currentRating = ratings[milestone.id];
                        return (
                          <View key={milestone.id} style={styles.milestoneRow}>
                            <Text style={[styles.milestoneLabel, senMode && { fontSize: FONT_SIZES.md }]}>
                              {senMode ? milestone.shortLabel : milestone.label}
                            </Text>
                            {senMode ? (
                              <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                            ) : null}
                            <View style={styles.ratingRow}>
                              {QUICK_RATING_LABELS.map(r => (
                                <TouchableOpacity
                                  key={r.value}
                                  style={[
                                    styles.ratingBtn,
                                    { borderColor: r.color },
                                    currentRating === r.value && { backgroundColor: r.color },
                                  ]}
                                  onPress={() => setRating(milestone.id, r.value)}
                                  activeOpacity={0.6}
                                >
                                  <Text
                                    style={[
                                      styles.ratingBtnText,
                                      { color: r.color },
                                      currentRating === r.value && { color: COLORS.white },
                                    ]}
                                  >
                                    {ASSESSMENT_CHOICES.find(choice => choice.value === r.value)?.shortLabel ?? r.shortLabel}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
              <Ionicons name="save" size={20} color={COLORS.white} />
              <Text style={styles.saveText}>Save Assessment ({ratedCount} ratings)</Text>
            </TouchableOpacity>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  termBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  termBtnActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  termText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  termTextActive: {
    color: COLORS.primary,
  },
  ratingKey: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  keyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
  },
  keyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  quickStartCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickStartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  quickStartTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  quickStartCopy: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  quickFillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  quickFillBtn: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
  },
  quickFillText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  clearText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  areaCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  areaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  areaSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  areaQuickRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  areaQuickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  areaQuickText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  miniDots: {
    flexDirection: 'row',
    gap: 3,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestonesContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  milestoneRow: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '60',
  },
  milestoneLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  ratingBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  ratingBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  saveText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
