import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import { MILESTONE_AREAS, RATING_LABELS, getMilestonesForAgeGroup, getCurrentTerm, getCurrentAcademicYear } from '../data/milestones';
import { EMOTIONS } from '../data/emotions';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSEN } from '../context/SENContext';
import { supabase } from '../lib/supabase';
import AddPupilModal from '../components/AddPupilModal';
import QuickAssess from '../components/QuickAssess';
import ProgressView from '../components/ProgressView';
import EmotionLogModal from '../components/EmotionLogModal';

interface Pupil {
  id: string;
  display_code: string;
  age_group: 'EYFS' | 'KS1';
  sen_status: boolean;
  notes: string;
  created_at: string;
}

interface Assessment {
  id: string;
  pupil_id: string;
  milestone_id: string;
  area_id: string;
  rating: number;
  term: string;
  academic_year: string;
  assessed_at: string;
}

interface EmotionLog {
  id: string;
  pupil_id: string;
  emotion_id: string;
  emotion_name: string;
  context: string;
  notes: string;
  logged_at: string;
}

export default function TrackerScreen() {
  const { user, setShowAuthModal } = useAuth();
  const { showToast, showConfirm } = useToast();
  const { senMode } = useSEN();
  const [mounted, setMounted] = useState(false);

  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showAddPupil, setShowAddPupil] = useState(false);
  const [assessPupil, setAssessPupil] = useState<Pupil | null>(null);
  const [progressPupil, setProgressPupil] = useState<Pupil | null>(null);
  const [emotionLogPupil, setEmotionLogPupil] = useState<Pupil | null>(null);
  const [filterAgeGroup, setFilterAgeGroup] = useState<'All' | 'EYFS' | 'KS1'>('All');

  // Defer Date-dependent values to after mount to prevent hydration mismatch
  const [currentTerm, setCurrentTerm] = useState('Autumn');
  const [currentYear, setCurrentYear] = useState('2025/2026');

  useEffect(() => {
    setMounted(true);
    setCurrentTerm(getCurrentTerm());
    setCurrentYear(getCurrentAcademicYear());
  }, []);


  // Load data when user is available
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setPupils([]);
      setAssessments([]);
      setEmotionLogs([]);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pupilRes, assessRes, emotionRes] = await Promise.all([
        supabase.from('tracker_pupils').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('tracker_assessments').select('*').eq('user_id', user.id),
        supabase.from('tracker_emotion_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }),
      ]);
      if (pupilRes.data) setPupils(pupilRes.data);
      if (assessRes.data) setAssessments(assessRes.data);
      if (emotionRes.data) setEmotionLogs(emotionRes.data);
    } catch (err) {
      console.error('Error loading tracker data:', err);
    }
    setLoading(false);
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAddPupil = async (pupilData: { display_code: string; age_group: 'EYFS' | 'KS1'; sen_status: boolean; notes: string }) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('tracker_pupils').insert({
        user_id: user.id,
        ...pupilData,
      }).select('*').single();
      if (error) throw error;
      if (data) {
        setPupils(prev => [...prev, data]);
        showToast('Pupil Added', `${pupilData.display_code} has been added to your tracker.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add pupil', 'error');
    }
  };

  const handleDeletePupil = (pupil: Pupil) => {
    showConfirm({
      title: 'Remove Pupil',
      message: `Remove ${pupil.display_code} and all their assessment data? This cannot be undone.`,
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          await supabase.from('tracker_assessments').delete().eq('pupil_id', pupil.id);
          await supabase.from('tracker_emotion_logs').delete().eq('pupil_id', pupil.id);
          await supabase.from('tracker_pupils').delete().eq('id', pupil.id);
          setPupils(prev => prev.filter(p => p.id !== pupil.id));
          setAssessments(prev => prev.filter(a => a.pupil_id !== pupil.id));
          setEmotionLogs(prev => prev.filter(l => l.pupil_id !== pupil.id));
          showToast('Removed', `${pupil.display_code} has been removed.`);
        } catch (err: any) {
          showToast('Error', err.message || 'Failed to remove pupil', 'error');
        }
      },
    });
  };

  const handleSaveAssessments = async (
    pupilId: string,
    newAssessments: { milestone_id: string; area_id: string; rating: number }[],
    term: string,
    academicYear: string
  ) => {
    if (!user) return;
    try {
      await supabase.from('tracker_assessments')
        .delete()
        .eq('user_id', user.id)
        .eq('pupil_id', pupilId)
        .eq('term', term)
        .eq('academic_year', academicYear);

      if (newAssessments.length > 0) {
        const rows = newAssessments.map(a => ({
          user_id: user.id,
          pupil_id: pupilId,
          milestone_id: a.milestone_id,
          area_id: a.area_id,
          rating: a.rating,
          term,
          academic_year: academicYear,
        }));
        const { data, error } = await supabase.from('tracker_assessments').insert(rows).select('*');
        if (error) throw error;

        setAssessments(prev => {
          const filtered = prev.filter(a => 
            !(a.pupil_id === pupilId && a.term === term && a.academic_year === academicYear)
          );
          return [...filtered, ...(data || [])];
        });
      }

      showToast('Assessment Saved', `${newAssessments.length} milestone ratings recorded.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save assessment', 'error');
    }
  };

  // Handle logging an emotion for a pupil
  const handleLogEmotion = async (
    pupilId: string,
    data: { emotion_id: string; emotion_name: string; context: string; notes: string }
  ) => {
    if (!user) return;
    try {
      const { data: logData, error } = await supabase.from('tracker_emotion_logs').insert({
        user_id: user.id,
        pupil_id: pupilId,
        emotion_id: data.emotion_id,
        emotion_name: data.emotion_name,
        context: data.context,
        notes: data.notes,
      }).select('*').single();
      
      if (error) throw error;
      if (logData) {
        setEmotionLogs(prev => [logData, ...prev]);
        const pupil = pupils.find(p => p.id === pupilId);
        showToast(
          'Emotion Logged',
          `${data.emotion_name} recorded for ${pupil?.display_code || 'pupil'}.`
        );
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to log emotion', 'error');
    }
  };

  const handleDeleteEmotionLog = async (logId: string) => {
    try {
      await supabase.from('tracker_emotion_logs').delete().eq('id', logId);
      setEmotionLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete log', 'error');
    }
  };

  const handleDeleteAllData = () => {
    showConfirm({
      title: 'Delete All Tracker Data',
      message: 'This will permanently delete all pupils, assessments, and emotion logs. This action cannot be undone. Are you sure?',
      confirmText: 'Delete All',
      onConfirm: async () => {
        if (!user) return;
        try {
          await supabase.from('tracker_emotion_logs').delete().eq('user_id', user.id);
          await supabase.from('tracker_assessments').delete().eq('user_id', user.id);
          await supabase.from('tracker_pupils').delete().eq('user_id', user.id);
          setPupils([]);
          setAssessments([]);
          setEmotionLogs([]);
          showToast('Data Deleted', 'All tracker data has been permanently removed.');
        } catch (err: any) {
          showToast('Error', err.message || 'Failed to delete data', 'error');
        }
      },
    });
  };

  // Get pupil's latest assessments for a specific term
  const getPupilAssessments = (pupilId: string, term?: string, year?: string): Assessment[] => {
    return assessments.filter(a => {
      if (a.pupil_id !== pupilId) return false;
      if (term && a.term !== term) return false;
      if (year && a.academic_year !== year) return false;
      return true;
    });
  };

  // Get latest assessment per milestone for a pupil
  const getLatestPupilAssessments = (pupilId: string): Assessment[] => {
    const pupilAssess = assessments.filter(a => a.pupil_id === pupilId);
    const latest: Record<string, Assessment> = {};
    pupilAssess.forEach(a => {
      const existing = latest[a.milestone_id];
      if (!existing || new Date(a.assessed_at) > new Date(existing.assessed_at)) {
        latest[a.milestone_id] = a;
      }
    });
    return Object.values(latest);
  };

  // Get emotion logs for a pupil
  const getPupilEmotionLogs = (pupilId: string): EmotionLog[] => {
    return emotionLogs.filter(l => l.pupil_id === pupilId);
  };

  // Get the most recent emotion for a pupil
  const getRecentEmotion = (pupilId: string): EmotionLog | null => {
    const logs = getPupilEmotionLogs(pupilId);
    return logs.length > 0 ? logs[0] : null;
  };

  // Calculate pupil summary
  const getPupilSummary = (pupil: Pupil) => {
    const latest = getLatestPupilAssessments(pupil.id);
    const areas = getMilestonesForAgeGroup(pupil.age_group);
    const totalMilestones = areas.reduce((s, a) => s + a.milestones.length, 0);
    const rated = latest.length;
    const avg = rated > 0 ? latest.reduce((s, a) => s + a.rating, 0) / rated : 0;
    const emotionCount = getPupilEmotionLogs(pupil.id).length;
    return { rated, totalMilestones, avg, emotionCount };
  };

  const filteredPupils = filterAgeGroup === 'All'
    ? pupils
    : pupils.filter(p => p.age_group === filterAgeGroup);



  // Not logged in state
  if (!mounted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );

  }
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <Ionicons name="analytics" size={24} color={COLORS.primary} />
          <Text style={styles.screenTitle}>Pupil Tracker</Text>
        </View>
        <View style={styles.authPrompt}>
          <View style={styles.authIcon}>
            <Ionicons name="lock-closed" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authText}>
            The Pupil Tracker stores assessment data securely in your teacher account. Sign in to start tracking pupil progress against EYFS and KS1 milestones.
          </Text>
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => setShowAuthModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.authBtnText}>Sign In to Continue</Text>
          </TouchableOpacity>
          <View style={styles.gdprBox}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gdprTitle}>GDPR Compliant</Text>
              <Text style={styles.gdprText}>
                No child names or identifiable data is collected. All pupils are tracked using anonymous codes only. Data is stored securely and can be deleted at any time.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>


      {/* Header */}
      <View style={styles.screenHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="analytics" size={24} color={COLORS.primary} />
          <View>
            <Text style={styles.screenTitle}>Pupil Tracker</Text>
            <Text style={styles.screenSub}>{currentTerm} {currentYear}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddPupil(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addBtnText}>Add Pupil</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* GDPR Banner */}
        <View style={styles.gdprBanner}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={styles.gdprBannerText}>
            GDPR Safe: Anonymous codes only. No child names stored. 
            <Text style={styles.gdprLink} onPress={handleDeleteAllData}> Delete all data</Text>
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Quick Assessment Guide</Text>
          </View>
          <Text style={styles.infoText}>
            Track each pupil against {MILESTONE_AREAS.length} development areas with {MILESTONE_AREAS.reduce((s, a) => s + a.milestones.length, 0)} milestones aligned to EYFS Development Matters and KS1 PSHE curriculum. Now includes emotion tracking for holistic wellbeing monitoring.
          </Text>
          <View style={styles.ratingKeyRow}>
            {RATING_LABELS.map(r => (
              <View key={r.value} style={[styles.ratingKeyItem, { backgroundColor: r.bgColor }]}>
                <View style={[styles.ratingKeyDot, { backgroundColor: r.color }]} />
                <Text style={[styles.ratingKeyLabel, { color: r.color }]}>{r.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {(['All', 'EYFS', 'KS1'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filterAgeGroup === f && styles.filterChipActive]}
              onPress={() => setFilterAgeGroup(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filterAgeGroup === f && styles.filterTextActive]}>
                {f === 'All' ? `All (${pupils.length})` : `${f} (${pupils.filter(p => p.age_group === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Class Overview Stats */}
        {filteredPupils.length > 0 ? (
          <View style={styles.overviewRow}>
            <View style={[styles.overviewCard, { backgroundColor: COLORS.bgLight }]}>
              <Text style={[styles.overviewNum, { color: COLORS.primary }]}>{filteredPupils.length}</Text>
              <Text style={styles.overviewLabel}>Pupils</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: COLORS.bgGreen }]}>
              <Text style={[styles.overviewNum, { color: COLORS.secondary }]}>
                {filteredPupils.filter(p => {
                  const s = getPupilSummary(p);
                  return s.rated > 0;
                }).length}
              </Text>
              <Text style={styles.overviewLabel}>Assessed</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: COLORS.bgPurple }]}>
              <Text style={[styles.overviewNum, { color: COLORS.purple }]}>
                {filteredPupils.filter(p => p.sen_status).length}
              </Text>
              <Text style={styles.overviewLabel}>SEN</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: COLORS.bgPink }]}>
              <Text style={[styles.overviewNum, { color: COLORS.pink }]}>
                {emotionLogs.length}
              </Text>
              <Text style={styles.overviewLabel}>Emotions</Text>
            </View>
          </View>
        ) : null}

        {/* Pupil Cards */}
        {filteredPupils.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={COLORS.mediumGray} />
            <Text style={styles.emptyTitle}>No pupils added yet</Text>
            <Text style={styles.emptyText}>
              Tap "Add Pupil" to start tracking progress. Use anonymous codes (P1, P2) to stay GDPR compliant.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowAddPupil(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.emptyBtnText}>Add First Pupil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pupilList}>
            {filteredPupils.map(pupil => {
              const summary = getPupilSummary(pupil);
              const recentEmotion = getRecentEmotion(pupil.id);
              const emotionData = recentEmotion ? EMOTIONS.find(e => e.id === recentEmotion.emotion_id) : null;
              const ratingLabel = summary.avg >= 3.5 ? RATING_LABELS[3]
                : summary.avg >= 2.5 ? RATING_LABELS[2]
                : summary.avg >= 1.5 ? RATING_LABELS[1]
                : summary.avg > 0 ? RATING_LABELS[0]
                : null;

              return (
                <View key={pupil.id} style={styles.pupilCard}>
                  <View style={styles.pupilHeader}>
                    <View style={[styles.pupilAvatar, { backgroundColor: pupil.age_group === 'EYFS' ? COLORS.bgLight : COLORS.bgGreen }]}>
                      <Text style={[styles.pupilAvatarText, { color: pupil.age_group === 'EYFS' ? COLORS.primary : COLORS.secondary }]}>
                        {pupil.display_code}
                      </Text>
                    </View>
                    <View style={styles.pupilInfo}>
                      <View style={styles.pupilTags}>
                        <View style={[styles.pupilTag, { backgroundColor: pupil.age_group === 'EYFS' ? COLORS.bgLight : COLORS.bgGreen }]}>
                          <Text style={[styles.pupilTagText, { color: pupil.age_group === 'EYFS' ? COLORS.primary : COLORS.secondary }]}>
                            {pupil.age_group}
                          </Text>
                        </View>
                        {pupil.sen_status ? (
                          <View style={[styles.pupilTag, { backgroundColor: COLORS.bgPurple }]}>
                            <Text style={[styles.pupilTagText, { color: COLORS.purple }]}>SEN</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.pupilStatus}>
                        {summary.rated > 0
                          ? `${summary.rated}/${summary.totalMilestones} assessed`
                          : 'Not yet assessed'}
                        {summary.emotionCount > 0 ? ` | ${summary.emotionCount} emotion logs` : ''}
                      </Text>
                    </View>
                    {ratingLabel ? (
                      <View style={[styles.ratingBadge, { backgroundColor: ratingLabel.bgColor }]}>
                        <Text style={[styles.ratingBadgeText, { color: ratingLabel.color }]}>
                          {summary.avg.toFixed(1)}
                        </Text>
                        <Text style={[styles.ratingBadgeLabel, { color: ratingLabel.color }]}>
                          {ratingLabel.shortLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Recent Emotion Banner */}
                  {emotionData && recentEmotion && (
                    <View style={[styles.emotionBanner, { backgroundColor: emotionData.bgColor }]}>
                      <Ionicons name={emotionData.icon as any} size={18} color={emotionData.color} />
                      <View style={styles.emotionBannerInfo}>
                        <Text style={[styles.emotionBannerText, { color: emotionData.color }]}>
                          Last feeling: {emotionData.name}
                        </Text>
                        <Text style={styles.emotionBannerTime}>
                          {formatTimeAgo(recentEmotion.logged_at)}
                          {recentEmotion.context ? ` during ${formatContext(recentEmotion.context)}` : ''}
                        </Text>
                      </View>
                      {/* Mini emotion history dots */}
                      <View style={styles.emotionDots}>
                        {getPupilEmotionLogs(pupil.id).slice(0, 5).map((log, i) => {
                          const em = EMOTIONS.find(e => e.id === log.emotion_id);
                          return (
                            <View
                              key={log.id}
                              style={[styles.emotionDot, { backgroundColor: em?.color || COLORS.mediumGray }]}
                            />
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Mini progress bars per area */}
                  {summary.rated > 0 ? (
                    <View style={styles.miniAreas}>
                      {getMilestonesForAgeGroup(pupil.age_group).map(area => {
                        const areaAssess = getLatestPupilAssessments(pupil.id).filter(a => a.area_id === area.id);
                        const areaAvg = areaAssess.length > 0
                          ? areaAssess.reduce((s, a) => s + a.rating, 0) / areaAssess.length
                          : 0;
                        const pct = Math.round((areaAvg / 4) * 100);
                        return (
                          <View key={area.id} style={styles.miniAreaRow}>
                            <Text style={styles.miniAreaLabel} numberOfLines={1}>{area.shortTitle}</Text>
                            <View style={styles.miniBarBg}>
                              {areaAvg > 0 ? (
                                <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: area.color }]} />
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}

                  {/* Actions */}
                  <View style={styles.pupilActions}>
                    <TouchableOpacity
                      style={styles.emotionBtn}
                      onPress={() => setEmotionLogPupil(pupil)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="heart" size={16} color={COLORS.white} />
                      <Text style={styles.emotionBtnText}>Log Emotion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.assessBtn}
                      onPress={() => setAssessPupil(pupil)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="clipboard" size={16} color={COLORS.white} />
                      <Text style={styles.assessBtnText}>Assess</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.progressBtn}
                      onPress={() => setProgressPupil(pupil)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="bar-chart" size={16} color={COLORS.primary} />
                      <Text style={styles.progressBtnText}>Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePupil(pupil)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Milestone Areas Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone Areas</Text>
          <Text style={styles.sectionSub}>
            Based on EYFS Development Matters 2021 and KS1 PSHE National Curriculum
          </Text>
          <View style={styles.areaGrid}>
            {MILESTONE_AREAS.map(area => (
              <View key={area.id} style={[styles.areaRefCard, { borderLeftColor: area.color }]}>
                <View style={[styles.areaRefIcon, { backgroundColor: area.bgColor }]}>
                  <Ionicons name={area.icon as any} size={18} color={area.color} />
                </View>
                <View style={styles.areaRefInfo}>
                  <Text style={styles.areaRefTitle}>{area.title}</Text>
                  <Text style={styles.areaRefSrc}>{area.source}</Text>
                  <Text style={styles.areaRefCount}>{area.milestones.length} milestones</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* GDPR Footer */}
        <View style={styles.gdprFooter}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
          <Text style={styles.gdprFooterTitle}>Data Protection Notice</Text>
          <Text style={styles.gdprFooterText}>
            This tracker is designed to be GDPR compliant. No child names, dates of birth, photographs, or other personally identifiable information is collected or stored. All pupils are identified by anonymous codes chosen by the teacher. Assessment and emotion log data is stored securely and linked only to your teacher account. You can delete all data at any time using the link above.
          </Text>
          <Text style={styles.gdprFooterText}>
            Milestones are based on the EYFS Development Matters 2021 framework (PSED area) and KS1 PSHE National Curriculum, aligned with the Cobie the Cactus story themes of emotional literacy, sensory awareness, and inclusion.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Pupil Modal */}
      {showAddPupil ? (
        <AddPupilModal
          visible={showAddPupil}
          onClose={() => setShowAddPupil(false)}
          onAdd={handleAddPupil}
          existingCodes={pupils.map(p => p.display_code)}
        />
      ) : null}

      {/* Quick Assess Modal */}
      {assessPupil ? (
        <QuickAssess
          visible={!!assessPupil}
          onClose={() => setAssessPupil(null)}
          onSave={(newAssessments, term, year) => {
            handleSaveAssessments(assessPupil.id, newAssessments, term, year);
          }}
          pupilCode={assessPupil.display_code}
          ageGroup={assessPupil.age_group}
          existingAssessments={getPupilAssessments(assessPupil.id, currentTerm, currentYear).map(a => ({
            milestone_id: a.milestone_id,
            area_id: a.area_id,
            rating: a.rating,
          }))}
        />
      ) : null}

      {/* Emotion Log Modal */}
      {emotionLogPupil ? (
        <EmotionLogModal
          visible={!!emotionLogPupil}
          onClose={() => setEmotionLogPupil(null)}
          onLog={(data) => handleLogEmotion(emotionLogPupil.id, data)}
          pupilCode={emotionLogPupil.display_code}
        />
      ) : null}

      {/* Progress Modal */}
      {progressPupil ? (
        <ProgressView
          visible={!!progressPupil}
          onClose={() => setProgressPupil(null)}
          pupilCode={progressPupil.display_code}
          ageGroup={progressPupil.age_group}
          senStatus={progressPupil.sen_status}
          assessments={assessments.filter(a => a.pupil_id === progressPupil.id)}
          emotionLogs={emotionLogs.filter(l => l.pupil_id === progressPupil.id)}
          onDeleteEmotionLog={handleDeleteEmotionLog}
        />
      ) : null}
    </SafeAreaView>
  );
}

// Helper functions
function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatContext(context: string): string {
  const labels: Record<string, string> = {
    morning: 'morning arrival',
    circle: 'circle time',
    lesson: 'lesson',
    playtime: 'playtime',
    lunchtime: 'lunchtime',
    transition: 'transition',
    afternoon: 'afternoon',
    'end-of-day': 'end of day',
    checkin: 'daily check-in',
    other: 'other',
  };
  return labels[context] || context;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  screenTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  screenSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  addBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  container: {
    flex: 1,
  },
  // Auth prompt
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  authIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  authTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  authText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.xxl,
  },
  authBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  gdprBox: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.bgGreen,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    maxWidth: 400,
  },
  gdprTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  gdprText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  // GDPR Banner
  gdprBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  gdprBannerText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  gdprLink: {
    color: COLORS.error,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  // Info card
  infoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  ratingKeyRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  ratingKeyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
  },
  ratingKeyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ratingKeyLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  // Overview
  overviewRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  overviewCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  overviewNum: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  overviewLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    marginTop: SPACING.xl,
  },
  emptyBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Pupil list
  pupilList: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  pupilCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  pupilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pupilAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupilAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  pupilInfo: {
    flex: 1,
  },
  pupilTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  pupilTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  pupilTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pupilStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  ratingBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  ratingBadgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: -2,
  },
  // Emotion banner on pupil card
  emotionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  emotionBannerInfo: {
    flex: 1,
  },
  emotionBannerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  emotionBannerTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  emotionDots: {
    flexDirection: 'row',
    gap: 3,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Mini area bars
  miniAreas: {
    marginTop: SPACING.md,
    gap: 4,
  },
  miniAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  miniAreaLabel: {
    width: 80,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  miniBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Actions
  pupilActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.md,
  },
  emotionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.pink,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  emotionBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  assessBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  assessBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  progressBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bgLight,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
  },
  progressBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Milestone areas section
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  areaGrid: {
    gap: SPACING.sm,
  },
  areaRefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    ...SHADOWS.small,
  },
  areaRefIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaRefInfo: {
    flex: 1,
  },
  areaRefTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  areaRefSrc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  areaRefCount: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    marginTop: 1,
  },
  // GDPR Footer
  gdprFooter: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  gdprFooterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  gdprFooterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
});
