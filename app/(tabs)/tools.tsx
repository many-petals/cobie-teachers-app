import React, { useState, useEffect } from 'react';
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
import { EMOTIONS } from '../data/emotions';
import AppSignOutButton from '../components/AppSignOutButton';
import EmotionCard from '../components/EmotionCard';
import CheckInScreen from '../components/CheckInScreen';
import EmotionHistory from '../components/EmotionHistory';
import SENBanner from '../components/SENBanner';
import { loadEmotionLogs, removeEmotionLog, type LocalEmotionLog } from '../lib/storage';

type Tab = 'emotions' | 'checkin' | 'history';

export default function ToolsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('emotions');
  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);
  const [emotionLogs, setEmotionLogs] = useState<LocalEmotionLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load emotion logs from local storage
  useEffect(() => {
    loadEmotionLogs().then(setEmotionLogs);
  }, [refreshKey]);

  const handleEmotionLogged = () => {
    // Refresh logs after a new check-in is saved
    setRefreshKey(k => k + 1);
  };

  const handleDeleteLog = async (id: string) => {
    await removeEmotionLog(id);
    setEmotionLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={24} color={COLORS.pink} />
          <Text style={styles.headerTitle}>Emotion Tools</Text>
        </View>
        <AppSignOutButton />
      </View>
      <SENBanner />

      <View style={styles.shortcutWrap}>
        <TouchableOpacity
          style={styles.voiceNotesCard}
          onPress={() => router.push('/voice-notes')}
          activeOpacity={0.8}
        >
          <View style={styles.voiceNotesIcon}>
            <Ionicons name="mic" size={22} color={COLORS.error} />
          </View>
          <View style={styles.voiceNotesInfo}>
            <Text style={styles.voiceNotesTitle}>Voice Notes</Text>
            <Text style={styles.voiceNotesText}>
              Record quick classroom observations and save them to your account.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'emotions' && styles.tabActive]}
          onPress={() => setActiveTab('emotions')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid"
            size={16}
            color={activeTab === 'emotions' ? COLORS.white : COLORS.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'emotions' && styles.tabTextActive]}>
            Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checkin' && styles.tabActive]}
          onPress={() => setActiveTab('checkin')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="happy"
            size={16}
            color={activeTab === 'checkin' ? COLORS.white : COLORS.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'checkin' && styles.tabTextActive]}>
            Check-In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => {
            setActiveTab('history');
            setRefreshKey(k => k + 1); // Refresh on tab switch
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time"
            size={16}
            color={activeTab === 'history' ? COLORS.white : COLORS.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History{emotionLogs.length > 0 ? ` (${emotionLogs.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'emotions' ? (
          <View style={styles.emotionsList}>
            <Text style={styles.intro}>
              Tap each emotion to explore child-friendly explanations, body clues, and calming strategies.
              Use these during circle time or one-to-one conversations.
            </Text>
            {EMOTIONS.map((emotion) => (
              <EmotionCard
                key={emotion.id}
                emotion={emotion}
                isExpanded={expandedEmotion === emotion.id}
                onPress={() =>
                  setExpandedEmotion(expandedEmotion === emotion.id ? null : emotion.id)
                }
              />
            ))}
          </View>
        ) : activeTab === 'checkin' ? (
          <CheckInScreen onEmotionLogged={handleEmotionLogged} />
        ) : (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Check-In History</Text>
            <Text style={styles.historySubtitle}>
              All emotion check-ins saved from the Daily Check-In tool. For pupil-specific emotion tracking, use the Pupil Tracker.
            </Text>
            <EmotionHistory
              logs={emotionLogs.map(l => ({
                id: l.id,
                emotion_id: l.emotion_id,
                emotion_name: l.emotion_name,
                context: l.context,
                notes: l.notes,
                logged_at: l.logged_at,
              }))}
              onDelete={handleDeleteLog}
              showDelete={true}
              maxItems={30}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  shortcutWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  voiceNotesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F7CACA',
    ...SHADOWS.small,
  },
  voiceNotesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNotesInfo: {
    flex: 1,
  },
  voiceNotesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  voiceNotesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
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
  container: {
    flex: 1,
  },
  emotionsList: {
    padding: SPACING.lg,
  },
  intro: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  historyContainer: {
    padding: SPACING.lg,
  },
  historyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
});
