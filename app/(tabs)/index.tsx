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
import { useAuth } from '../context/AuthContext';
import { LESSONS } from '../data/lessons';
import { ACTIVITIES } from '../data/activities';
import { PRINTABLES } from '../data/printables';
import { BRAND } from '../data/brand';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1771287970946_68002315.png';


const QUICK_TILES = [
  { title: 'Lessons', subtitle: '4 Core', icon: 'book', color: '#1B6B93', bgColor: '#E1F5FE', route: '/lessons' },
  { title: 'Activities', subtitle: '8 Optional', icon: 'color-palette', color: '#7BC67E', bgColor: '#E8F5E9', route: '/activities' },
  { title: 'Tracker', subtitle: 'Milestones', icon: 'analytics', color: '#9C27B0', bgColor: '#F3E5F5', route: '/tracker' },
  { title: 'Printables', subtitle: '18 Resources', icon: 'print', color: '#F4A460', bgColor: '#FFF3E0', route: '/printables' },
  { title: 'Parents', subtitle: '4 Letters', icon: 'people', color: '#1B6B93', bgColor: '#E1F5FE', route: '/parents' },
  { title: 'Emotions', subtitle: 'Interactive', icon: 'heart', color: '#F48FB1', bgColor: '#FCE4EC', route: '/tools' },
  { title: 'Calm Corner', subtitle: 'Builder', icon: 'leaf', color: '#81C784', bgColor: '#E8F5E9', route: '/calm' },
];



const TEACHING_FLOW = [
  { step: 1, title: 'Read the story', icon: 'book-outline', color: '#4FC3F7' },
  { step: 2, title: 'Choose a core lesson', icon: 'school-outline', color: '#81C784' },
  { step: 3, title: 'Add optional activities', icon: 'add-circle-outline', color: '#FFB74D' },
  { step: 4, title: 'Send parent letters home', icon: 'people-outline', color: '#1B6B93' },
  { step: 5, title: 'Use printables to reinforce', icon: 'print-outline', color: '#CE93D8' },
  { step: 6, title: 'Track pupil milestones', icon: 'analytics-outline', color: '#9C27B0' },
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
    signOut, updateProfile, deleteCalmConfig,
  } = useAuth();
  const router = useRouter();

  const favLessons = favourites.filter(f => f.resource_type === 'lesson');
  const favActivities = favourites.filter(f => f.resource_type === 'activity');
  const favPrintables = favourites.filter(f => f.resource_type === 'printable');

  if (!user) return null;

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

          <ScrollView showsVerticalScrollIndicator={false}>
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

  <Text style={{ fontSize: 14, lineHeight: 20 }}>
    Cobie the Cactus is a ready-to-use emotional literacy toolkit for EYFS
    and KS1 classrooms. Through story-based learning, practical activities,
    and simple wellbeing tracking, Cobie helps children understand emotions,
    build sensory awareness and develop inclusion and empathy — all with
    no preparation required.
  </Text>
</View>

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
});

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, setShowAuthModal, completedLessons, favourites } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  // Track client-side mount to prevent hydration mismatch from auth state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>


      {/* App Header Bar with Many Petals branding */}
      <View style={styles.appHeader}>
        <View style={styles.appHeaderLeft}>
          <Image
            source={{ uri: BRAND.logoUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.appHeaderTitle}>{BRAND.shortName}</Text>
            <Text style={styles.appHeaderSub}>{BRAND.tagline}</Text>
          </View>

        </View>
        <View style={styles.headerActions}>
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image
            source={{ uri: HERO_IMAGE }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <View style={styles.heroRow}>
                <View style={styles.heroTextCol}>
                  <Text style={styles.heroTitle}>Cobie the Cactus</Text>
                  <Text style={styles.heroSubtitle}>EYFS & KS1 Teacher Pack</Text>
                  <Text style={styles.heroDescription}>
                    Classroom-ready resources for emotional literacy, sensory awareness, and inclusion.
                    Evidence-based. SEN-first. No preparation required.
                  </Text>
                </View>
                <Image
                  source={{ uri: BRAND.logoUrl }}
                  style={styles.heroMascot}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => router.push('/lessons')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="play-circle" size={22} color={COLORS.white} />
                  <Text style={styles.heroButtonText}>Start Teaching</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroButtonSecondary}
                  onPress={() => setShowPricing(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.heroButtonSecondaryText}>View Plans</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

{/* Cobie introduction */}
<View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>
    How Cobie Supports Your Classroom
  </Text>

  <Text style={{ fontSize: 14, lineHeight: 20 }}>
    Cobie the Cactus is a ready-to-use emotional literacy toolkit for EYFS
    and KS1 classrooms. Through story-based learning, practical activities,
    and simple wellbeing tracking, Cobie helps children understand emotions,
    build sensory awareness and develop inclusion and empathy — all with
    no preparation required.
  </Text>
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
                  <Text style={styles.progressNum}>{completedLessons.length}/4</Text>
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
                  <Text style={[styles.progressLabel, { color: COLORS.primary, fontWeight: '700' }]}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* SEN Mode Toggle */}
        <SENBanner />

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
                  onPress={() => router.push(tile.route as any)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Workbook Promo - Compact */}
        <View style={styles.section}>
          <WorkbookPromo compact />
        </View>

        {/* Today's Activity */}
        <TodayActivity
          onViewActivity={(id) => router.push(`/activity/${id}` as any)}
        />

        {/* Teaching Flow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Flow</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these steps for a complete lesson experience
          </Text>
          <View style={styles.flowContainer}>
            {TEACHING_FLOW.map((item, index) => (
              <View key={item.step} style={styles.flowItem}>
                <View style={[styles.flowIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.flowContent}>
                  <Text style={styles.flowStep}>Step {item.step}</Text>
                  <Text style={styles.flowTitle}>{item.title}</Text>
                </View>
                {index < TEACHING_FLOW.length - 1 ? (
                  <View style={styles.flowArrow}>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.mediumGray} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Workbook Promo - Full */}
        <WorkbookPromo />

        {/* What's Inside */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Inside</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: COLORS.bgLight }]}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>4</Text>
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
          <Image
            source={{ uri: BRAND.logoUrl }}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrand}>{BRAND.name}</Text>
          <Text style={styles.footerText}>{BRAND.storyTitle}</Text>
          <Text style={styles.footerText}>{BRAND.packDescription}</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setShowPricing(true)}>
              <Text style={styles.footerLink}>Pricing</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => router.push('/printables' as any)}>
              <Text style={styles.footerLink}>Printables</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => router.push('/parents' as any)}>
              <Text style={styles.footerLink}>Parents</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>|</Text>
            <TouchableOpacity onPress={() => router.push('/tracker' as any)}>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  appHeaderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.secondary,
    lineHeight: 18,
  },
  appHeaderSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
    maxWidth: 100,
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
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
    fontSize: FONT_SIZES.lg,
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
  hero: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 107, 147, 0.82)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: SPACING.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroTextCol: {
    flex: 1,
  },
  heroMascot: {
    width: 110,
    height: 130,
    borderRadius: RADIUS.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 2,
  },
  heroDescription: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroButtonSecondaryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
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
    marginTop: SPACING.huge,
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
    paddingBottom: SPACING.huge,
  },
  footerLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },

  footerBrand: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
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

