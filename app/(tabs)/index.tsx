import React, { useState, useEffect } from 'react';
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
import QuickTile from '../components/QuickTile';
import TodayActivity from '../components/TodayActivity';
import WorkbookPromo from '../components/WorkbookPromo';
import EvidenceBanner from '../components/EvidenceBanner';
import PricingSection from '../components/PricingSection';
import BrandLockup from '../components/BrandLockup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LESSONS } from '../data/lessons';
import { ACTIVITIES } from '../data/activities';
import { PRINTABLES } from '../data/printables';
import { BRAND, LOCAL_LOGO } from '../data/brand';
import { openParentApp, ParentAppSection } from '../lib/parentAppLinks';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1771287970946_68002315.png';

type QuickTileConfig = {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  route?: string;
  externalSection?: ParentAppSection;
};

type HeaderLinkConfig = {
  label: string;
  route?: string;
  externalSection?: ParentAppSection;
};

const QUICK_TILES: QuickTileConfig[] = [
  { title: 'Lessons', subtitle: '8 Core', icon: 'book', color: '#1B6B93', bgColor: '#E1F5FE', route: '/lessons' },
  { title: 'Activities', subtitle: '8 Optional', icon: 'color-palette', color: '#7BC67E', bgColor: '#E8F5E9', route: '/activities' },
  { title: 'Tracker', subtitle: 'Parent App', icon: 'analytics', color: '#9C27B0', bgColor: '#F3E5F5', externalSection: 'tracker' },
  { title: 'Printables', subtitle: '18 Resources', icon: 'print', color: '#F4A460', bgColor: '#FFF3E0', route: '/printables' },
  { title: 'Parents', subtitle: 'Parent App', icon: 'people', color: '#1B6B93', bgColor: '#E1F5FE', externalSection: 'home' },
  { title: 'Emotions', subtitle: 'Interactive', icon: 'heart', color: '#F48FB1', bgColor: '#FCE4EC', route: '/tools' },
  { title: 'Calm Corner', subtitle: 'Builder', icon: 'leaf', color: '#81C784', bgColor: '#E8F5E9', route: '/calm' },
];

const HEADER_LINKS: HeaderLinkConfig[] = [
  { label: 'Lessons', route: '/lessons' },
  { label: 'Activities', route: '/activities' },
  { label: 'Printables', route: '/printables' },
  { label: 'Tracker', externalSection: 'tracker' },
  { label: 'Parents', externalSection: 'home' },
];


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
  const [showProfile, setShowProfile] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [insideExpanded, setInsideExpanded] = useState(false);
  // Track client-side mount to prevent hydration mismatch from auth state
  const [mounted, setMounted] = useState(false);
  const isCompactHero = width < 1320;
  const isTightHero = width < 1080;
  const showDesktopNav = width >= 1100;
  const showDesktopHero = width >= 980;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTilePress = async (tile: QuickTileConfig) => {
    if (tile.externalSection) {
      await openParentApp(tile.externalSection);
      return;
    }

    if (tile.route) {
      router.push(tile.route as any);
    }
  };

  const handleHeaderLinkPress = async (link: HeaderLinkConfig) => {
    if (link.externalSection) {
      await openParentApp(link.externalSection);
      return;
    }

    if (link.route) {
      router.push(link.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>


      {/* App Header Bar with Many Petals branding */}
      <View style={styles.appHeader}>
        <BrandLockup size={showDesktopNav ? 'md' : 'sm'} mode="plain" />
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
          <TouchableOpacity
            style={styles.pricingBtn}
            onPress={() => setShowPricing(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="diamond-outline" size={16} color={COLORS.accentOrange} />
          </TouchableOpacity>
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        {/* Hero Section */}
        <View style={styles.heroOuter}>
          <View style={[styles.hero, isCompactHero && styles.heroCompact, isTightHero && styles.heroTight]}>
            <View style={styles.heroGlowLeft} />
            <View style={styles.heroGlowRight} />
            <View style={[styles.heroInner, showDesktopHero && styles.heroInnerDesktop]}>
              <View style={[styles.heroContent, isCompactHero && styles.heroContentCompact]}>
                <Text style={styles.heroEyebrow}>Many Petals companion resource</Text>
                <Text style={[styles.heroTitle, isCompactHero && styles.heroTitleCompact, isTightHero && styles.heroTitleTight]}>
                  Teach emotional literacy with{'\n'}
                  <Text style={styles.heroTitleAccent}>Cobie the Cactus</Text>
                </Text>
                <Text style={[styles.heroSubtitle, isTightHero && styles.heroSubtitleTight]}>
                  Ready-to-teach emotional literacy for EYFS &amp; KS1, inspired by {BRAND.storyTitle}.
                </Text>

                <View style={styles.heroButtons}>
                  <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => router.push('/lessons')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="play-circle" size={20} color={COLORS.white} />
                    <Text style={styles.heroButtonText}>Start teaching</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heroButtonSecondary}
                    onPress={() => router.push('/activities')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heroButtonSecondaryText}>Explore activities</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>8</Text>
                    <Text style={styles.heroStatLabel}>core lessons</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>18</Text>
                    <Text style={styles.heroStatLabel}>ready-to-print resources</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>EYFS + KS1</Text>
                    <Text style={styles.heroStatLabel}>friendly</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.heroTextLink}
                  onPress={() => router.push('/guide' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.heroTextLinkText}>How to use this programme</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>

              <View style={[styles.heroVisualWrap, !showDesktopHero && styles.heroVisualWrapStack]}>
                <View style={styles.heroVisualCard}>
                  <Image
                    source={{ uri: HERO_IMAGE }}
                    style={styles.heroVisualImage}
                    resizeMode="cover"
                  />
                  <View style={styles.heroVisualBubble}>
                    <Text style={styles.heroVisualBubbleText}>Big feelings are welcome here.</Text>
                  </View>
                </View>
                {!showDesktopHero ? (
                  <Image
                    source={LOCAL_LOGO}
                    style={styles.heroMascotBadge}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            </View>
          </View>
        </View>


        {/* Welcome back / progress for logged-in users */}
        {mounted && user ? (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeTop}>
                <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                <Text style={styles.welcomeTitle}>
                  Welcome back, {profile?.name?.split(' ')[0] || 'Teacher'}!
                </Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNum}>{completedLessons.length}/8</Text>
                  <Text style={styles.progressLabel}>Lessons Done</Text>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Text style={styles.progressNum}>{favourites.length}</Text>
                  <Text style={styles.progressLabel}>Saved Items</Text>
                </View>
                <View style={styles.progressDivider} />
                <TouchableOpacity style={styles.progressItem} onPress={() => setShowProfile(true)}>
                  <Ionicons name="bookmark" size={20} color={COLORS.primary} />
                  <Text style={[styles.progressLabel, { color: COLORS.primary, fontWeight: '700' }]}>Open profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* SEN Mode Toggle */}
        {!showDesktopNav ? <SENBanner /> : null}

        {/* Quick Access Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.tileGrid}>
            {QUICK_TILES.map((tile) => (
              <View key={tile.title} style={styles.tileWrapper}>
                <QuickTile
                  title={tile.title}
                  subtitle={tile.subtitle}
                  icon={tile.icon}
                  color={tile.color}
                  bgColor={tile.bgColor}
                  onPress={() => {
                    handleTilePress(tile).catch(() => {});
                  }}
                />
              </View>
            ))}
          </View>
        </View>


        {/* Today's Activity */}
        <TodayActivity
  style={{ marginBottom: 8 }}
          onViewActivity={(id) => router.push(`/activity/${id}` as any)}
        />
 
          

        {/* Companion Workbook */}
        <View style={styles.section}>
          <WorkbookPromo compact />
        </View>

        {/* What's Inside */}
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
        <TouchableOpacity
  onPress={() => setInsideExpanded(!insideExpanded)}
  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
>
  <Text style={styles.sectionTitle}>What's Inside</Text>
  <Ionicons
    name={insideExpanded ? 'chevron-up' : 'chevron-down'}
    size={20}
    color={COLORS.textLight}
  />
</TouchableOpacity>
          <View style={styles.statsRow}>
            {insideExpanded && (
              <>
                <View style={[styles.statCard, { backgroundColor: COLORS.bgLight }]}>
                  <Text style={[styles.statNumber, { color: COLORS.primary }]}>8</Text>
                  <Text style={styles.statLabel}>Core Lessons</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: COLORS.bgGreen }]}>
                  <Text style={[styles.statNumber, { color: COLORS.secondary }]}>8</Text>
                  <Text style={styles.statLabel}>Activities</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: COLORS.bgOrange }]}>
                  <Text style={[styles.statNumber, { color: COLORS.accentOrange }]}>18</Text>
                  <Text style={styles.statLabel}>Printables</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: COLORS.bgPink }]}>
                  <Text style={[styles.statNumber, { color: COLORS.pink }]}>4</Text>
                  <Text style={styles.statLabel}>Parent Letters</Text>
                </View>
              </>
            )}
          </View>
        </View>


        {/* Evidence-Based Section */}
        <EvidenceBanner />

        {/* Curriculum Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curriculum Areas Covered</Text>
          <View style={styles.curriculumList}>
            {[
              { icon: 'heart-outline', label: 'Personal, Social & Emotional Development (PSED)', color: COLORS.pink },
              { icon: 'chatbubbles-outline', label: 'Communication & Language', color: COLORS.primary },
              { icon: 'globe-outline', label: 'Understanding the World', color: COLORS.secondary },
              { icon: 'accessibility-outline', label: 'SEND Focus: Sensory Needs & Inclusion', color: COLORS.purple },
            ].map((item) => (
              <View key={item.label} style={styles.curriculumItem}>
                <View style={[styles.curriculumIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.curriculumText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing CTA */}
        <View style={styles.section}>
          <View style={styles.pricingCTA}>
            <View style={styles.pricingCTALeft}>
              <Ionicons name="diamond" size={24} color={COLORS.accentOrange} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pricingCTATitle}>Support This Resource</Text>
                <Text style={styles.pricingCTAText}>
                  Help us keep creating free and affordable teaching resources for every classroom.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pricingCTABtn}
              onPress={() => setShowPricing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.pricingCTABtnText}>View Plans</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Icon Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Icons Guide</Text>
          <View style={styles.iconGrid}>
            {[
              { icon: 'eye', label: 'Sensory', color: COLORS.sensory },
              { icon: 'heart', label: 'Emotional', color: COLORS.emotional },
              { icon: 'chatbubbles', label: 'Communication', color: COLORS.communication },
              { icon: 'color-palette', label: 'Creative', color: COLORS.creative },
              { icon: 'body', label: 'Movement', color: COLORS.movement },
              { icon: 'leaf', label: 'Reflection', color: COLORS.reflection },
            ].map((item) => (
              <View key={item.label} style={styles.iconLegendItem}>
                <View style={[styles.iconLegendCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.iconLegendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <BrandLockup size="sm" mode="plain" />
          <Text style={styles.footerStory}>{BRAND.tagline}</Text>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    flex: 1,
    marginHorizontal: SPACING.xl,
  },
  headerNavLink: {
    paddingVertical: SPACING.xs,
  },
  headerNavText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
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
    paddingHorizontal: SPACING.md,
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
    maxWidth: 96,
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
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
    paddingTop: SPACING.xl,
  },
  hero: {
    minHeight: 440,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8FBEF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E7EFD7',
  },
  heroCompact: {
    minHeight: 420,
  },
  heroTight: {
    minHeight: 540,
  },
  heroGlowLeft: {
    position: 'absolute',
    top: -30,
    left: -20,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(245,215,110,0.20)',
  },
  heroGlowRight: {
    position: 'absolute',
    right: -40,
    top: 30,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(27,107,147,0.10)',
  },
  heroInner: {
    flexDirection: 'column',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxxl,
  },
  heroInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroContent: {
    width: '100%',
    maxWidth: 620,
    minWidth: 0,
    alignSelf: 'flex-start',
  },
  heroContentCompact: {
    maxWidth: 560,
  },
  heroEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: '#5F7B4D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: 54,
    fontWeight: '800',
    color: '#213A2E',
    lineHeight: 60,
    maxWidth: '100%',
  },
  heroTitleAccent: {
    color: '#D59B13',
  },
  heroTitleCompact: {
    fontSize: 46,
    lineHeight: 52,
  },
  heroTitleTight: {
    fontSize: 40,
    lineHeight: 46,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    color: COLORS.textLight,
    marginTop: SPACING.lg,
    lineHeight: 28,
  },
  heroSubtitleTight: {
    fontSize: FONT_SIZES.md,
  },
  heroDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 8,
    lineHeight: 18,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    flexWrap: 'wrap',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#1E5D44',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#E5E2D7',
  },
  heroButtonSecondaryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroTextLink: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  heroTextLinkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  heroStat: {
    minWidth: 100,
  },
  heroStatNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: '#214335',
  },
  heroStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  heroVisualWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  heroVisualWrapStack: {
    maxWidth: '100%',
  },
  heroVisualCard: {
    minHeight: 320,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    ...SHADOWS.large,
  },
  heroVisualImage: {
    width: '100%',
    height: '100%',
  },
  heroVisualBubble: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  heroVisualBubbleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  heroMascotBadge: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  tileWrapper: {
    width: '31%',
    minWidth: 100,
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
    marginTop: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
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
