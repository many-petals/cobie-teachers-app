import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ParentProgressSummary, ParentShareApproval } from './parentSharing';

const getKey = (key: string, userId?: string) => (userId ? `${key}_${userId}` : key);

const KEYS = {
  FAVOURITES: (userId?: string) => getKey('@cobie_favourites', userId),
  COMPLETED_LESSONS: (userId?: string) => getKey('@cobie_completed_lessons', userId),
  CALM_CONFIGS: (userId?: string) => getKey('@cobie_calm_configs', userId),
  SEN_MODE: (userId?: string) => getKey('@cobie_sen_mode', userId),
  CHECK_IN_HISTORY: (userId?: string) => getKey('@cobie_check_in_history', userId),
  VOICE_NOTES: (userId?: string) => getKey('@cobie_voice_notes', userId),
  WEEKLY_PLANS: (userId?: string) => getKey('@cobie_weekly_plans', userId),
  EMOTION_LOGS: (userId?: string) => getKey('@cobie_emotion_logs', userId),
  PARENT_SHARE_APPROVALS: (userId?: string) => getKey('@cobie_parent_share_approvals', userId),
  PARENT_PROGRESS_SUMMARIES: (userId?: string) => getKey('@cobie_parent_progress_summaries', userId),
} as const;

export interface LocalFavourite {
  id: string;
  resource_type: 'lesson' | 'activity' | 'printable';
  resource_id: string;
}

export interface LocalCompletedLesson {
  lesson_id: string;
  completed_at: string;
}

export interface LocalCalmConfig {
  id: string;
  name: string;
  emotion: string;
  noise: string;
  time_available: number;
  created_at: string;
}

export interface VoiceNote {
  id: string;
  title: string;
  uri: string;
  duration: number;
  pupilCode?: string;
  tags: string[];
  transcript?: string;
  created_at: string;
}

export interface SavedWeeklyPlan {
  id: string;
  name: string;
  ageGroup: string;
  plan: any;
  created_at: string;
}

export interface LocalEmotionLog {
  id: string;
  pupil_id?: string;
  pupil_code?: string;
  emotion_id: string;
  emotion_name: string;
  context: string;
  notes: string;
  logged_at: string;
}

function generateLocalId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err);
  }
}

export async function loadFavourites(userId?: string): Promise<LocalFavourite[]> {
  return getJSON<LocalFavourite[]>(KEYS.FAVOURITES(userId), []);
}

export async function saveFavourites(favourites: LocalFavourite[], userId?: string): Promise<void> {
  return setJSON(KEYS.FAVOURITES(userId), favourites);
}

export async function addFavourite(
  resourceType: 'lesson' | 'activity' | 'printable',
  resourceId: string,
  userId?: string,
): Promise<LocalFavourite> {
  const favourites = await loadFavourites(userId);
  const newFav: LocalFavourite = {
    id: generateLocalId(),
    resource_type: resourceType,
    resource_id: resourceId,
  };
  favourites.push(newFav);
  await saveFavourites(favourites, userId);
  return newFav;
}

export async function removeFavourite(id: string, userId?: string): Promise<void> {
  const favourites = await loadFavourites(userId);
  await saveFavourites(
    favourites.filter(favourite => favourite.id !== id),
    userId,
  );
}

export async function loadCompletedLessons(userId?: string): Promise<LocalCompletedLesson[]> {
  return getJSON<LocalCompletedLesson[]>(KEYS.COMPLETED_LESSONS(userId), []);
}

export async function saveCompletedLessons(lessons: LocalCompletedLesson[], userId?: string): Promise<void> {
  return setJSON(KEYS.COMPLETED_LESSONS(userId), lessons);
}

export async function addCompletedLesson(lessonId: string, userId?: string): Promise<LocalCompletedLesson> {
  const lessons = await loadCompletedLessons(userId);
  const existing = lessons.find(lesson => lesson.lesson_id === lessonId);
  if (existing) return existing;

  const newLesson: LocalCompletedLesson = {
    lesson_id: lessonId,
    completed_at: new Date().toISOString(),
  };
  lessons.push(newLesson);
  await saveCompletedLessons(lessons, userId);
  return newLesson;
}

export async function loadCalmConfigs(userId?: string): Promise<LocalCalmConfig[]> {
  return getJSON<LocalCalmConfig[]>(KEYS.CALM_CONFIGS(userId), []);
}

export async function saveCalmConfigs(configs: LocalCalmConfig[], userId?: string): Promise<void> {
  return setJSON(KEYS.CALM_CONFIGS(userId), configs);
}

export async function addCalmConfig(
  config: { name: string; emotion: string; noise: string; time_available: number },
  userId?: string,
): Promise<LocalCalmConfig> {
  const configs = await loadCalmConfigs(userId);
  const newConfig: LocalCalmConfig = {
    id: generateLocalId(),
    ...config,
    created_at: new Date().toISOString(),
  };
  configs.unshift(newConfig);
  await saveCalmConfigs(configs, userId);
  return newConfig;
}

export async function removeCalmConfig(id: string, userId?: string): Promise<void> {
  const configs = await loadCalmConfigs(userId);
  await saveCalmConfigs(
    configs.filter(config => config.id !== id),
    userId,
  );
}

export async function loadSENMode(userId?: string): Promise<boolean> {
  return getJSON<boolean>(KEYS.SEN_MODE(userId), false);
}

export async function saveSENMode(enabled: boolean, userId?: string): Promise<void> {
  return setJSON(KEYS.SEN_MODE(userId), enabled);
}

export async function loadVoiceNotes(userId?: string): Promise<VoiceNote[]> {
  return getJSON<VoiceNote[]>(KEYS.VOICE_NOTES(userId), []);
}

export async function saveVoiceNotes(notes: VoiceNote[], userId?: string): Promise<void> {
  return setJSON(KEYS.VOICE_NOTES(userId), notes);
}

export async function addVoiceNote(note: Omit<VoiceNote, 'id' | 'created_at'>, userId: string): Promise<VoiceNote> {
  const notes = await loadVoiceNotes(userId);
  const newNote: VoiceNote = {
    id: generateLocalId(),
    ...note,
    created_at: new Date().toISOString(),
  };
  notes.unshift(newNote);
  await saveVoiceNotes(notes, userId);
  return newNote;
}

export async function updateVoiceNote(id: string, updates: Partial<VoiceNote>, userId: string): Promise<void> {
  const notes = await loadVoiceNotes(userId);
  const index = notes.findIndex(note => note.id === id);
  if (index >= 0) {
    notes[index] = { ...notes[index], ...updates };
    await saveVoiceNotes(notes, userId);
  }
}

export async function removeVoiceNote(id: string, userId: string): Promise<void> {
  const notes = await loadVoiceNotes(userId);
  await saveVoiceNotes(
    notes.filter(note => note.id !== id),
    userId,
  );
}

export async function loadWeeklyPlans(userId?: string): Promise<SavedWeeklyPlan[]> {
  return getJSON<SavedWeeklyPlan[]>(KEYS.WEEKLY_PLANS(userId), []);
}

export async function saveWeeklyPlans(plans: SavedWeeklyPlan[], userId?: string): Promise<void> {
  return setJSON(KEYS.WEEKLY_PLANS(userId), plans);
}

export async function addWeeklyPlan(
  plan: Omit<SavedWeeklyPlan, 'id' | 'created_at'>,
  userId?: string,
): Promise<SavedWeeklyPlan> {
  const plans = await loadWeeklyPlans(userId);
  const newPlan: SavedWeeklyPlan = {
    id: generateLocalId(),
    ...plan,
    created_at: new Date().toISOString(),
  };
  plans.unshift(newPlan);
  await saveWeeklyPlans(plans, userId);
  return newPlan;
}

export async function removeWeeklyPlan(id: string, userId?: string): Promise<void> {
  const plans = await loadWeeklyPlans(userId);
  await saveWeeklyPlans(
    plans.filter(plan => plan.id !== id),
    userId,
  );
}

export async function loadEmotionLogs(userId?: string): Promise<LocalEmotionLog[]> {
  return getJSON<LocalEmotionLog[]>(KEYS.EMOTION_LOGS(userId), []);
}

export async function saveEmotionLogs(logs: LocalEmotionLog[], userId?: string): Promise<void> {
  return setJSON(KEYS.EMOTION_LOGS(userId), logs);
}

export async function addEmotionLog(log: Omit<LocalEmotionLog, 'id'>, userId?: string): Promise<LocalEmotionLog> {
  const logs = await loadEmotionLogs(userId);
  const newLog: LocalEmotionLog = {
    id: generateLocalId(),
    ...log,
  };
  logs.unshift(newLog);
  await saveEmotionLogs(logs, userId);
  return newLog;
}

export async function removeEmotionLog(id: string, userId?: string): Promise<void> {
  const logs = await loadEmotionLogs(userId);
  await saveEmotionLogs(
    logs.filter(log => log.id !== id),
    userId,
  );
}

export async function getEmotionLogsForPupil(pupilId: string, userId?: string): Promise<LocalEmotionLog[]> {
  const logs = await loadEmotionLogs(userId);
  return logs.filter(log => log.pupil_id === pupilId);
}

export async function loadParentShareApprovals(userId?: string): Promise<ParentShareApproval[]> {
  return getJSON<ParentShareApproval[]>(KEYS.PARENT_SHARE_APPROVALS(userId), []);
}

export async function saveParentShareApprovals(approvals: ParentShareApproval[], userId?: string): Promise<void> {
  return setJSON(KEYS.PARENT_SHARE_APPROVALS(userId), approvals);
}

export async function upsertParentShareApproval(approval: ParentShareApproval, userId?: string): Promise<void> {
  const approvals = await loadParentShareApprovals(userId);
  const next = approvals.filter(
    item => !(item.pupilCode === approval.pupilCode && item.moduleSlug === approval.moduleSlug),
  );
  next.unshift(approval);
  await saveParentShareApprovals(next, userId);
}

export async function loadParentProgressSummaries(userId?: string): Promise<ParentProgressSummary[]> {
  return getJSON<ParentProgressSummary[]>(KEYS.PARENT_PROGRESS_SUMMARIES(userId), []);
}

export async function saveParentProgressSummaries(summaries: ParentProgressSummary[], userId?: string): Promise<void> {
  return setJSON(KEYS.PARENT_PROGRESS_SUMMARIES(userId), summaries);
}

export async function upsertParentProgressSummary(summary: ParentProgressSummary, userId?: string): Promise<void> {
  const summaries = await loadParentProgressSummaries(userId);
  const next = summaries.filter(
    item => !(item.pupilCode === summary.pupilCode && item.moduleSlug === summary.moduleSlug),
  );
  next.unshift(summary);
  await saveParentProgressSummaries(next, userId);
}

export async function clearAllLocalData(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      ...Object.values(KEYS).map(keyFactory => keyFactory(userId ?? undefined)),
      '@cobie_favourites',
      '@cobie_completed_lessons',
      '@cobie_calm_configs',
      '@cobie_sen_mode',
      '@cobie_check_in_history',
      '@cobie_voice_notes',
      '@cobie_weekly_plans',
      '@cobie_emotion_logs',
      '@cobie_parent_share_approvals',
      '@cobie_parent_progress_summaries',
    ]);
  } catch (err) {
    console.warn('[Storage] Failed to clear data:', err);
  }
}

export { KEYS as STORAGE_KEYS };
