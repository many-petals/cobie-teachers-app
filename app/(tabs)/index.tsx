import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../data/theme';
import SENBanner from '../components/SENBanner';
import PricingSection from '../components/PricingSection';
import BrandLockup from '../components/BrandLockup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LESSONS } from '../data/lessons';
import { ACTIVITIES } from '../data/activities';
import { PRINTABLES } from '../data/printables';
import { BRAND } from '../data/brand';
import { LITTLE_PETALS_BOOK_MODULES } from '../data/bookModules';
import { openParentApp, ParentAppSection } from '../lib/parentAppLinks';

const HERO_CHARACTER_IMAGE = require('../assets/images/cobie-hero.png');

type HeaderLinkConfig = {
  label: string;
  route?: string;
  externalSection?: ParentAppSection;
};

const HEADER_LINKS: HeaderLinkConfig[] = [
  { label: 'Lessons', route: '/lessons' },
  { label: 'Activities', route: '/activities' },
  { label: 'Printables', route: '/printables' },
  { label: 'Tracker', externalSection: 'tracker' },
  { label: 'Parents', externalSection: 'home' },
];

const TEACHER_FLOW = [
  {
    icon: 'book-outline',
    title: 'Teach the lesson',
    text: 'Open the matching story-led lesson pack. The steps, objective, and outcome are already written for you.',
  },
  {
    icon: 'print-outline',
    title: 'Print what you need',
    text: 'Use branded A4 worksheets, cards, posters, and classroom prompts without rebuilding resources from scratch.',
  },
  {
    icon: 'analytics-outline',
    title: 'Track progress',
    text: 'Tap simple progress ratings for each pupil. The app turns observations into useful classroom evidence.',
  },
  {
    icon: 'people-outline',
    title: 'Send parent follow-up',
    text: 'Generate pre-filled parent letters and progress summaries from tracker data when you are ready to share.',
  },
] as const;


// Safe date formatter that avoids hydration mismatches
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

// Profile modal component inlined
function ProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const {
    user, profile, favourites, completedLessons, savedCalmConfigs,
    signOut, clearUserData, updateProfile, deleteCalmConfig,
  } = useAuth();
  const { showToast, showConfirm } = useToast();
  const router = useRouter();

  const favLessons = favourites.filter(f => f.resource_type === 'lesson');
  const favActivities = favourites.filter(f => f.resource_type === 'activity');
  const favPrintables = favourites.filter(f => f.resource_type === 'printable');

  if (!user) return null;

  const handleDeleteMyData = () => {
    showConfirm({
      title: 'Delete My Data',
      message: 'This will permanently delete your tracker records, favourites, completed lessons, saved calm plans, and profile data, then sign you out. This action cannot be undone.',
      confirmText: 'Delete Data',
      onConfirm: async () => {
        const result = await clearUserData();
        if (result.error) {
          showToast('Error', result.error, 'error');
          return;
        }

        onClose();
        showToast('Data Deleted', 'Your app data has been permanently removed.');
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={pStyles.overlay}>
        <View style={pStyles.container}>
          <View style={pStyles.header}>
            <Text style={pStyles.headerTitle}>My Profile</Text>
            <TouchableOpacity onPress={onClose} style={pStyles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={true}>
            {/* Profile Card */}
            <View style={pStyles.profileCard}>
              <View style={pStyles.avatarCircle}>
                <Ionicons name="person" size={32} color={COLORS.primary} />
              </View>
              <View style={pStyles.profileInfo}>
                <Text style={pStyles.profileName}>{profile?.name || 'Teacher'}</Text>
                <Text style={pStyles.profileRole}>{profile?.role || 'EYFS Teacher'}</Text>
                {profile?.school ? (
                  <View style={pStyles.schoolRow}>
                    <Ionicons name="school-outline" size={14} color={COLORS.textMuted} />
                    <Text style={pStyles.schoolText}>{profile.school}</Text>
                  </View>
                ) : null}
                <Text style={pStyles.emailText}>{user.email}</Text>
              </View>
            </View>
            {/* Cobie introduction */}
<View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>
    How Cobie Supports Your Classroom
  </Text>
  </View>
<Text style={{ fontSize: 14, lineHeight: 20 }}>
  Cobie the Cactus is an evidence-informed emotional literacy programme designed for EYFS and Key Stage 1 classrooms. It helps children understand emotions, develop calming strategies, and build empathy through short, practical activities that fit easily into the school day.
  
  The programme combines four simple elements:
Daily Emotion Check-Ins  
Short 1-2 minute check-ins help children recognise and name their feelings. Over time this builds emotional awareness and helps teachers notice children who may need additional support.
</Text>


            {/* Stats */}
            <View style={pStyles.statsRow}>
              <View style={[pStyles.statCard, { backgroundColor: COLORS.bgLight }]}>
                <Text style={[pStyles.statNum, { color: COLORS.primary }]}>{favourites.length}</Text>
                <Text style={pStyles.statLabel}>Favourites</Text>
              </View>
              <View style={[pStyles.statCard, { backgroundColor: COLORS.bgGreen }]}>
                <Text style={[pStyles.statNum, { color: COLORS.secondary }]}>{completedLessons.length}</Text>
                <Text style={pStyles.statLabel}>Completed</Text>
              </View>
              <View style={[pStyles.statCard, { backgroundColor: COLORS.bgPurple }]}>
                <Text style={[pStyles.statNum, { color: COLORS.purple }]}>{savedCalmConfigs.length}</Text>
                <Text style={pStyles.statLabel}>Calm Plans</Text>
              </View>
            </View>

            {/* Completed Lessons */}
            {completedLessons.length > 0 ? (
              <View style={pStyles.section}>
                <Text style={pStyles.sectionTitle}>Completed Lessons</Text>
                {completedLessons.map((cl) => {
                  const lesson = LESSONS.find(l => l.id === cl.lesson_id);
                  if (!lesson) return null;
                  return (
                    <View key={cl.lesson_id} style={[pStyles.itemCard, { borderLeftColor: lesson.color }]}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                      <View style={{ flex: 1 }}>
                        <Text style={pStyles.itemTitle}>Lesson {lesson.number}: {lesson.title}</Text>
                        <Text style={pStyles.itemSub}>
                          Completed {formatDate(cl.completed_at)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* Favourite Lessons */}
            {favLessons.length > 0 ? (
              <View style={pStyles.section}>
                <Text style={pStyles.sectionTitle}>Favourite Lessons</Text>
                {favLessons.map((f) => {
                  const lesson = LESSONS.find(l => l.id === f.resource_id);
                  if (!lesson) return null;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[pStyles.itemCard, { borderLeftColor: lesson.color }]}
                      onPress={() => { onClose(); router.push('/lessons'); }}
                    >
                      <Ionicons name="book" size={18} color={lesson.color} />
                      <Text style={pStyles.itemTitle}>{lesson.title}</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* Favourite Activities */}
            {favActivities.length > 0 ? (
              <View style={pStyles.section}>
                <Text style={pStyles.sectionTitle}>Favourite Activities</Text>
                {favActivities.map((f) => {
                  const activity = ACTIVITIES.find(a => a.id === f.resource_id);
                  if (!activity) return null;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[pStyles.itemCard, { borderLeftColor: activity.color }]}
                      onPress={() => { onClose(); router.push(`/activity/${activity.id}` as any); }}
                    >
                      <Ionicons name={activity.icon as any} size={18} color={activity.color} />
                      <Text style={pStyles.itemTitle}>{activity.title}</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* Favourite Printables */}
            {favPrintables.length > 0 ? (
              <View style={pStyles.section}>
                <Text style={pStyles.sectionTitle}>Favourite Printables</Text>
                {favPrintables.map((f) => {
                  const printable = PRINTABLES.find(p => p.id === f.resource_id);
                  if (!printable) return null;
                  return (
                    <View key={f.id} style={[pStyles.itemCard, { borderLeftColor: printable.color }]}>
                      <Ionicons name={printable.icon as any} size={18} color={printable.color} />
                      <Text style={pStyles.itemTitle}>{printable.title}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* Saved Calm Configs */}
            {savedCalmConfigs.length > 0 ? (
              <View style={pStyles.section}>
                <Text style={pStyles.sectionTitle}>Saved Calm Plans</Text>
                {savedCalmConfigs.map((config) => (
                  <View key={config.id} style={[pStyles.itemCard, { borderLeftColor: COLORS.secondary }]}>
                    <Ionicons name="leaf" size={18} color={COLORS.secondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={pStyles.itemTitle}>{config.name}</Text>
                      <Text style={pStyles.itemSub}>
                        {config.emotion} / {config.noise} / {config.time_available} min
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteCalmConfig(config.id)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Empty state */}
            {favourites.length === 0 && completedLessons.length === 0 && savedCalmConfigs.length === 0 ? (
              <View style={pStyles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={COLORS.mediumGray} />
                <Text style={pStyles.emptyTitle}>No saved items yet</Text>
                <Text style={pStyles.emptyText}>
                  Tap the bookmark icon on lessons, activities, and printables to save them here.
                </Text>
              </View>
            ) : null}

            {/* Sign Out */}
            <TouchableOpacity style={pStyles.signOutBtn} onPress={() => { signOut(); onClose(); }} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={pStyles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={pStyles.deleteDataBtn} onPress={handleDeleteMyData} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              <Text style={pStyles.deleteDataText}>Delete My Data</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const pStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, maxHeight: '92%', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.xl, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, marginBottom: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight, borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.lg },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  profileRole: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  schoolRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  schoolText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  emailText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  statNum: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textLight, marginTop: 2 },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, ...SHADOWS.small },
  itemTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  itemSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.huge },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textLight, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xl },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: '#FFEBEE', marginTop: SPACING.xl },
  signOutText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.error },
  deleteDataBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.error, marginTop: SPACING.md },
  deleteDataText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
});

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, profile, setShowAuthModal, completedLessons, favourites } = useAuth();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [bookSectionY, setBookSectionY] = useState(0);
  // Track client-side mount to prevent hydration mismatch from auth state
  const [mounted, setMounted] = useState(false);
  const isCompactHero = width < 1160;
  const isTightHero = width < 780;
  const showHeroVisual = width >= 720;
  const showDesktopNav = width >= 1024;
  const showDesktopHero = width >= 980;
  const showDesktopShell = width >= 1180;
  const headerBrandSize = width < 420 ? 'sm' : 'md';
  const bookCardWidth = width >= 1180 ? '31.7%' : width >= 760 ? '48.5%' : '100%';
  const flowCardWidth = width >= 980 ? '23.5%' : width >= 560 ? '48.5%' : '100%';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHeaderLinkPress = async (link: HeaderLinkConfig) => {
    if (link.externalSection) {
      await openParentApp(link.externalSection);
      return;
    }

    if (link.route) {
      router.push(link.route as any);
    }
  };

  const scrollToBookSection = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(bookSectionY - 12, 0),
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>


      {/* App Header Bar with Many Petals branding */}
        <View style={[styles.appHeader, showDesktopShell && styles.appHeaderDesktop]}>
          <BrandLockup size={showDesktopNav ? 'md' : headerBrandSize} mode="plain" />
          {showDesktopNav ? (
            <View style={styles.headerNav}>
            {HEADER_LINKS.map((link) => (
              <TouchableOpacity
                key={link.label}
                style={styles.headerNavLink}
                onPress={() => {
                  handleHeaderLinkPress(link).catch(() => {});
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.headerNavText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <View style={styles.headerActions}>
          {showDesktopNav ? <SENBanner compact /> : null}
          {!showDesktopNav ? (
            <TouchableOpacity
              style={styles.pricingBtn}
              onPress={() => setShowPricing(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="diamond-outline" size={16} color={COLORS.accentOrange} />
            </TouchableOpacity>
          ) : null}
          {mounted && user ? (
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setShowProfile(true)}
              activeOpacity={0.7}
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.name?.split(' ')[0] || 'Profile'}
              </Text>
            </TouchableOpacity>
          ) : mounted ? (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => setShowAuthModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="log-in-outline" size={18} color={COLORS.white} />
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={styles.heroOuter}>
          <View style={[styles.hero, isCompactHero && styles.heroCompact, isTightHero && styles.heroTight]}>
            <View style={styles.heroGlowLeft} />
            <View style={styles.heroGlowRight} />
            <View style={styles.heroWashLeft} />
            <View style={styles.heroWashRight} />
            <View style={[styles.heroInner, showDesktopHero && styles.heroInnerDesktop]}>
              <View style={[styles.heroContent, isCompactHero && styles.heroContentCompact]}>
                <Text style={styles.heroEyebrow}>Little Petals teacher companion apps</Text>
                <Text style={[styles.heroTitle, isCompactHero && styles.heroTitleCompact, isTightHero && styles.heroTitleTight]}>
                  Choose the book. Teach the lesson. Share the next step.
                </Text>
                <Text style={[styles.heroSubtitle, isTightHero && styles.heroSubtitleTight]}>
                  Story-led emotional literacy packs for EYFS &amp; KS1 teachers who need ready-to-teach lessons, A4 printables, tracker tools, and parent support.
                </Text>

                <View style={styles.heroButtons}>
                  <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => router.push('/lessons')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="book-outline" size={20} color={COLORS.white} />
                    <Text style={styles.heroButtonText}>Continue Cobie app</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heroButtonSecondary}
                    onPress={scrollToBookSection}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heroButtonSecondaryText}>View all apps</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>6</Text>
                    <Text style={styles.heroStatLabel}>book companions</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>EYFS + KS1</Text>
                    <Text style={styles.heroStatLabel}>classroom-ready</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>A4</Text>
                    <Text style={styles.heroStatLabel}>printables included</Text>
                  </View>
                </View>
              </View>

              {showHeroVisual ? (
                <View style={[styles.heroVisualWrap, !showDesktopHero && styles.heroVisualWrapStack]}>
                  <View style={styles.heroVisualScene}>
                    <View style={styles.heroVisualGlow} />
                    <View style={styles.heroVisualSun} />
                    <View style={styles.heroVisualCloud} />
                    <View style={styles.heroVisualCloudSecondary} />
                    <View style={styles.heroVisualGround} />
                    <View style={styles.heroCharacterWrap}>
                      <Image
                        source={HERO_CHARACTER_IMAGE}
                        style={styles.heroCharacterImage}
                        resizeMode="contain"
                      />
                    </View>
                    {showDesktopHero ? (
                      <View style={styles.heroVisualBubble}>
                        <Text style={styles.heroVisualBubbleText}>Cobie app live now</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {!showDesktopNav ? <SENBanner /> : null}

        <View style={styles.section}>
          <View style={styles.flowBand}>
            <View style={styles.flowIntro}>
              <Text style={styles.sectionEyebrow}>Built into every companion app</Text>
              <Text style={styles.sectionTitle}>Lesson, printable, tracker, and parent letter - already done for you</Text>
              <Text style={styles.sectionSubtitle}>
                Teachers do not need to build extra templates, spreadsheets, or letters. Each book app gives one clear route: teach the story, print the resource, track progress, then share the next step.
              </Text>
            </View>
            <View style={styles.flowGrid}>
              {TEACHER_FLOW.map((item) => (
                <View key={item.title} style={[styles.flowCard, { width: flowCardWidth }]}>
                  <View style={styles.flowCardIcon}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.flowCardTitle}>{item.title}</Text>
                  <Text style={styles.flowCardText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View
          style={styles.section}
          onLayout={(event) => setBookSectionY(event.nativeEvent.layout.y)}
        >
          <Text style={styles.sectionEyebrow}>Choose your companion app</Text>
          <Text style={styles.sectionTitle}>Each Little Petals book becomes a ready-to-use classroom pack</Text>
          <Text style={styles.sectionSubtitle}>
            Cobie is live first. Darcy and the next four books will follow the same simple pattern, so teachers do not have to relearn the app each time.
          </Text>
          <View style={styles.bookGrid}>
            {LITTLE_PETALS_BOOK_MODULES.map((module) => {
              const isLive = module.status === 'live';
              const isDarcy = module.id === 'darcy';

              return (
                <View
                  key={module.id}
                  style={[
                    styles.bookCard,
                    { width: bookCardWidth, borderTopColor: module.themeColor },
                    !isLive && styles.bookCardMuted,
                  ]}
                >
                  <View style={styles.bookCardTop}>
                    <View style={[styles.bookIcon, { backgroundColor: module.themeColor + '20' }]}>
                      <Text style={[styles.bookIconText, { color: module.themeColor }]}>{module.shortName.charAt(0)}</Text>
                    </View>
                    <View style={[styles.bookStatusPill, { backgroundColor: module.themeColor + '20' }]}>
                      <Text style={[styles.bookStatusText, { color: module.themeColor }]}>{module.appStatusLabel}</Text>
                    </View>
                  </View>
                  <Text style={styles.bookTitle}>{module.displayName}</Text>
                  <Text style={styles.bookSubtitle}>{module.bookTitle}</Text>
                  <Text style={styles.bookFocus}>{module.teachingFocus}</Text>
                  <Text style={styles.bookPromise}>{module.teacherPromise}</Text>

                  <View style={styles.bookMetaRow}>
                    <View style={styles.bookMetaPill}>
                      <Ionicons name="school-outline" size={13} color={COLORS.primary} />
                      <Text style={styles.bookMetaText}>{module.stageLabel}</Text>
                    </View>
                    <View style={styles.bookMetaPill}>
                      <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                      <Text style={styles.bookMetaText}>{isLive ? 'Use now' : 'Planned'}</Text>
                    </View>
                  </View>

                  <View style={styles.bookActions}>
                    <TouchableOpacity
                      style={[styles.bookPrimaryButton, !isLive && styles.bookButtonDisabled]}
                      onPress={() => {
                        if (isLive) router.push('/lessons');
                      }}
                      disabled={!isLive}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.bookPrimaryButtonText, !isLive && styles.bookButtonDisabledText]}>
                        {isLive ? 'Open app' : isDarcy ? 'App in development' : 'Coming soon'}
                      </Text>
                      {isLive ? <Ionicons name="arrow-forward" size={15} color={COLORS.white} /> : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bookSecondaryButton}
                      onPress={() => {}}
                      disabled
                    >
                      <Text style={styles.bookSecondaryButtonText}>Book link coming soon</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {mounted && user ? (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeTop}>
                <Ionicons name="sparkles" size={18} color={COLORS.accent} />
                <Text style={styles.welcomeTitle}>
                  Cobie progress snapshot
                </Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNum}>{completedLessons.length}/8</Text>
                  <Text style={styles.progressLabel}>Lessons done</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Text style={styles.progressNum}>{favourites.length}</Text>
                  <Text style={styles.progressLabel}>Saved items</Text>
                </View>
                <View style={styles.progressDivider} />
                <TouchableOpacity style={styles.progressItem} onPress={() => setShowProfile(true)}>
                  <Ionicons name="bookmark" size={18} color={COLORS.primary} />
                  <Text style={[styles.progressLabel, { color: COLORS.primary, fontWeight: '700' }]}>Open profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <BrandLockup size="lg" mode="wordmark" showSubtitle={false} />
          <Text style={styles.footerText}>{BRAND.sharedPlatformLine}</Text>
          <Text style={styles.footerBookLine}>{BRAND.storyTitle}</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setShowPricing(true)}>
              <Text style={styles.footerLink}>Pricing</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => router.push('/printables' as any)}>
              <Text style={styles.footerLink}>Printables</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => { openParentApp('home').catch(() => {}); }}>
              <Text style={styles.footerLink}>Parents</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => { openParentApp('tracker').catch(() => {}); }}>
              <Text style={styles.footerLink}>Tracker</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerLinksSecondary}>
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() => router.push('/privacy' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.primary} />
              <Text style={styles.privacyLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>


          <Text style={styles.footerCopyright}>
            For classroom and educational use. Not for resale or redistribution.
          </Text>
          <Text style={styles.footerCopyright}>
            {BRAND.copyright}
          </Text>
        </View>
      </ScrollView>


      {/* Profile Modal - only render on client side */}
      {mounted ? (
        <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />
      ) : null}

      {/* Pricing Modal - only render on client side to prevent hydration mismatch */}
      {mounted ? (
        <PricingSection visible={showPricing} onClose={() => setShowPricing(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    minHeight: 74,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEDC',
  },
  appHeaderDesktop: {
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
    minHeight: 82,
    paddingHorizontal: 40,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  headerNavLink: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  headerNavText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#55665E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 0,
  },
  pricingBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 80,
    height: 32,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.round,
  },
  signInText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 84,
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: SPACING.xl,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  welcomeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  welcomeHelper: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  progressNum: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.lightGray,
  },
  heroOuter: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    minHeight: 320,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F4FAEA',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5EDD9',
    ...SHADOWS.medium,
  },
  heroCompact: {
    minHeight: 296,
  },
  heroTight: {
    minHeight: 0,
  },
  heroGlowLeft: {
    position: 'absolute',
    top: -40,
    left: -34,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(253,231,122,0.28)',
  },
  heroGlowRight: {
    position: 'absolute',
    right: -26,
    top: 12,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(212,239,255,0.26)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -82,
    left: 180,
    width: 320,
    height: 180,
    borderRadius: 160,
    backgroundColor: 'rgba(214,243,208,0.42)',
  },
  heroWashLeft: {
    position: 'absolute',
    inset: 0,
    right: '42%',
    backgroundColor: '#F8FCEB',
  },
  heroWashRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '44%',
    backgroundColor: '#E9F8F4',
  },
  heroInner: {
    flexDirection: 'column',
    gap: SPACING.md,
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  heroInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xl,
    paddingHorizontal: 48,
    paddingVertical: 34,
  },
  heroContent: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    minWidth: 0,
    alignSelf: 'flex-start',
  },
  heroContentCompact: {
    maxWidth: 510,
  },
  heroEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: '#647A57',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#213A2E',
    lineHeight: 54,
    maxWidth: '100%',
    letterSpacing: 0,
  },
  heroTitleAccent: {
    color: '#D89C19',
  },
  heroTitleCompact: {
    fontSize: 42,
    lineHeight: 46,
  },
  heroTitleTight: {
    fontSize: 34,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#55665E',
    marginTop: SPACING.sm,
    lineHeight: 28,
  },
  heroSubtitleTight: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  heroDescription: {
    fontSize: FONT_SIZES.sm,
    color: '#708077',
    marginTop: SPACING.xs,
    lineHeight: 22,
    maxWidth: 500,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#1E5D44',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.round,
    ...SHADOWS.medium,
  },
  heroButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#DCE6D4',
  },
  heroButtonSecondaryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xl,
    marginTop: SPACING.lg,
  },
  heroStat: {
    minWidth: 110,
  },
  heroStatNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: '#214335',
  },
  heroStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#708077',
    marginTop: 2,
  },
  heroVisualWrap: {
    width: '40%',
    maxWidth: 430,
    minWidth: 270,
    alignSelf: 'center',
  },
  heroVisualWrapStack: {
    maxWidth: '100%',
    width: '100%',
    minWidth: 0,
    marginTop: SPACING.sm,
  },
  heroVisualScene: {
    minHeight: 290,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroVisualPanel: {
    position: 'absolute',
    inset: 0,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(76,142,80,0.08)',
  },
  heroVisualGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,245,199,0.9)',
    top: 10,
  },
  heroVisualSun: {
    position: 'absolute',
    top: 22,
    right: 16,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFD85C',
  },
  heroVisualCloud: {
    position: 'absolute',
    top: 92,
    left: 40,
    width: 82,
    height: 30,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  heroVisualCloudSecondary: {
    position: 'absolute',
    top: 126,
    right: 72,
    width: 62,
    height: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  heroVisualGround: {
    position: 'absolute',
    bottom: 16,
    width: 210,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(155,199,130,0.26)',
  },
  heroCharacterWrap: {
    width: 330,
    height: 266,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroCharacterImage: {
    width: '100%',
    height: '100%',
  },
  heroVisualBubble: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(76,142,80,0.14)',
    ...SHADOWS.small,
  },
  heroVisualBubbleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#5A6F62',
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
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
    marginBottom: SPACING.md,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  bookCard: {
    minWidth: 230,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2EBDD',
    borderTopWidth: 5,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  bookCardMuted: {
    backgroundColor: '#FBFCFA',
  },
  bookCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bookIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIconText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
  },
  bookStatusPill: {
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  bookStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bookTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#5F7B4D',
    marginBottom: SPACING.sm,
  },
  bookFocus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  bookPromise: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  bookMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  bookMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
  },
  bookMetaText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookActions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  bookPrimaryButton: {
    minHeight: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  bookPrimaryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  bookButtonDisabled: {
    backgroundColor: '#E9EFE7',
  },
  bookButtonDisabledText: {
    color: '#6F7F76',
  },
  bookSecondaryButton: {
    minHeight: 40,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#DDE7D7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  bookSecondaryButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  flowBand: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#F7FAF2',
    borderWidth: 1,
    borderColor: '#DFEAD8',
    padding: SPACING.lg,
  },
  flowIntro: {
    maxWidth: 720,
  },
  flowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  flowCard: {
    minWidth: 180,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5EDD9',
  },
  flowCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  flowCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  flowCardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 17,
  },
  blueprintCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E3EDDA',
    ...SHADOWS.small,
  },
  blueprintIntro: {
    maxWidth: 760,
  },
  blueprintGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  blueprintStepCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
    minWidth: 200,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  blueprintStepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  blueprintStepLetter: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  blueprintStepCopy: {
    flex: 1,
  },
  blueprintStepTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  blueprintStepText: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 17,
    color: COLORS.textLight,
  },
  collectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E3EDDA',
    ...SHADOWS.small,
  },
  collectionIntro: {
    maxWidth: 760,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  collectionItem: {
    minWidth: 220,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  collectionStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  collectionStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  collectionText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.textLight,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  tileWrapper: {
    minWidth: 180,
  },
  flowContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  flowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  flowContent: {
    flex: 1,
  },
  flowStep: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  flowTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  flowArrow: {
    marginLeft: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  curriculumList: {
    gap: SPACING.md,
  },
  curriculumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  curriculumIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curriculumText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  pricingCTA: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accentOrange + '30',
    ...SHADOWS.small,
  },
  pricingCTALeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  pricingCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  pricingCTAText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginTop: 4,
  },
  pricingCTABtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accentOrange,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  pricingCTABtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  iconLegendItem: {
    width: '30%',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  iconLegendCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLegendLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  footer: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  footerStory: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 420,
  },
  footerBookLine: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  footerLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footerDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
  },
  footerCopyright: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  footerLinksSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  privacyLinkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
