import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  FAVOURITES: '@cobie_favourites',
  COMPLETED_LESSONS: '@cobie_completed_lessons',
  CALM_CONFIGS: '@cobie_calm_configs',
  SEN_MODE: '@cobie_sen_mode',
  CHECK_IN_HISTORY: '@cobie_check_in_history',
  VOICE_NOTES: '@cobie_voice_notes',
  WEEKLY_PLANS: '@cobie_weekly_plans',
  EMOTION_LOGS: '@cobie_emotion_logs',
} as const;


// Types matching AuthContext
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
  duration: number; // seconds
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

// Generate a simple unique ID for local records
function generateLocalId(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

// ─── Generic helpers ────────────────────────────────────────────────

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

// ─── Favourites ─────────────────────────────────────────────────────

export async function loadFavourites(): Promise<LocalFavourite[]> {
  return getJSON<LocalFavourite[]>(KEYS.FAVOURITES, []);
}

export async function saveFavourites(favourites: LocalFavourite[]): Promise<void> {
  return setJSON(KEYS.FAVOURITES, favourites);
}

export async function addFavourite(resourceType: 'lesson' | 'activity' | 'printable', resourceId: string): Promise<LocalFavourite> {
  const favourites = await loadFavourites();
  const newFav: LocalFavourite = {
    id: generateLocalId(),
    resource_type: resourceType,
    resource_id: resourceId,
  };
  favourites.push(newFav);
  await saveFavourites(favourites);
  return newFav;
}

export async function removeFavourite(id: string): Promise<void> {
  const favourites = await loadFavourites();
  const filtered = favourites.filter(f => f.id !== id);
  await saveFavourites(filtered);
}

// ─── Completed Lessons ──────────────────────────────────────────────

export async function loadCompletedLessons(): Promise<LocalCompletedLesson[]> {
  return getJSON<LocalCompletedLesson[]>(KEYS.COMPLETED_LESSONS, []);
}

export async function saveCompletedLessons(lessons: LocalCompletedLesson[]): Promise<void> {
  return setJSON(KEYS.COMPLETED_LESSONS, lessons);
}

export async function addCompletedLesson(lessonId: string): Promise<LocalCompletedLesson> {
  const lessons = await loadCompletedLessons();
  const existing = lessons.find(l => l.lesson_id === lessonId);
  if (existing) return existing;
  const newLesson: LocalCompletedLesson = {
    lesson_id: lessonId,
    completed_at: new Date().toISOString(),
  };
  lessons.push(newLesson);
  await saveCompletedLessons(lessons);
  return newLesson;
}

// ─── Calm Configs ───────────────────────────────────────────────────

export async function loadCalmConfigs(): Promise<LocalCalmConfig[]> {
  return getJSON<LocalCalmConfig[]>(KEYS.CALM_CONFIGS, []);
}

export async function saveCalmConfigs(configs: LocalCalmConfig[]): Promise<void> {
  return setJSON(KEYS.CALM_CONFIGS, configs);
}

export async function addCalmConfig(config: { name: string; emotion: string; noise: string; time_available: number }): Promise<LocalCalmConfig> {
  const configs = await loadCalmConfigs();
  const newConfig: LocalCalmConfig = {
    id: generateLocalId(),
    ...config,
    created_at: new Date().toISOString(),
  };
  configs.unshift(newConfig);
  await saveCalmConfigs(configs);
  return newConfig;
}

export async function removeCalmConfig(id: string): Promise<void> {
  const configs = await loadCalmConfigs();
  const filtered = configs.filter(c => c.id !== id);
  await saveCalmConfigs(filtered);
}

// ─── SEN Mode ───────────────────────────────────────────────────────

export async function loadSENMode(): Promise<boolean> {
  return getJSON<boolean>(KEYS.SEN_MODE, false);
}

export async function saveSENMode(enabled: boolean): Promise<void> {
  return setJSON(KEYS.SEN_MODE, enabled);
}

// ─── Voice Notes ────────────────────────────────────────────────────

export async function loadVoiceNotes(): Promise<VoiceNote[]> {
  return getJSON<VoiceNote[]>(KEYS.VOICE_NOTES, []);
}

export async function saveVoiceNotes(notes: VoiceNote[]): Promise<void> {
  return setJSON(KEYS.VOICE_NOTES, notes);
}

export async function addVoiceNote(note: Omit<VoiceNote, 'id' | 'created_at'>): Promise<VoiceNote> {
  const notes = await loadVoiceNotes();
  const newNote: VoiceNote = {
    id: generateLocalId(),
    ...note,
    created_at: new Date().toISOString(),
  };
  notes.unshift(newNote);
  await saveVoiceNotes(notes);
  return newNote;
}

export async function updateVoiceNote(id: string, updates: Partial<VoiceNote>): Promise<void> {
  const notes = await loadVoiceNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx >= 0) {
    notes[idx] = { ...notes[idx], ...updates };
    await saveVoiceNotes(notes);
  }
}

export async function removeVoiceNote(id: string): Promise<void> {
  const notes = await loadVoiceNotes();
  const filtered = notes.filter(n => n.id !== id);
  await saveVoiceNotes(filtered);
}

// ─── Weekly Plans ───────────────────────────────────────────────────

export async function loadWeeklyPlans(): Promise<SavedWeeklyPlan[]> {
  return getJSON<SavedWeeklyPlan[]>(KEYS.WEEKLY_PLANS, []);
}

export async function saveWeeklyPlans(plans: SavedWeeklyPlan[]): Promise<void> {
  return setJSON(KEYS.WEEKLY_PLANS, plans);
}

export async function addWeeklyPlan(plan: Omit<SavedWeeklyPlan, 'id' | 'created_at'>): Promise<SavedWeeklyPlan> {
  const plans = await loadWeeklyPlans();
  const newPlan: SavedWeeklyPlan = {
    id: generateLocalId(),
    ...plan,
    created_at: new Date().toISOString(),
  };
  plans.unshift(newPlan);
  await saveWeeklyPlans(plans);
  return newPlan;
}

export async function removeWeeklyPlan(id: string): Promise<void> {
  const plans = await loadWeeklyPlans();
  const filtered = plans.filter(p => p.id !== id);
  await saveWeeklyPlans(filtered);
}

// ─── Emotion Logs (local fallback for check-in history) ─────────────


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

export async function loadEmotionLogs(): Promise<LocalEmotionLog[]> {
  return getJSON<LocalEmotionLog[]>(KEYS.EMOTION_LOGS, []);
}

export async function saveEmotionLogs(logs: LocalEmotionLog[]): Promise<void> {
  return setJSON(KEYS.EMOTION_LOGS, logs);
}

export async function addEmotionLog(log: Omit<LocalEmotionLog, 'id'>): Promise<LocalEmotionLog> {
  const logs = await loadEmotionLogs();
  const newLog: LocalEmotionLog = {
    id: generateLocalId(),
    ...log,
  };
  logs.unshift(newLog);
  await saveEmotionLogs(logs);
  return newLog;
}

export async function removeEmotionLog(id: string): Promise<void> {
  const logs = await loadEmotionLogs();
  const filtered = logs.filter(l => l.id !== id);
  await saveEmotionLogs(filtered);
}

export async function getEmotionLogsForPupil(pupilId: string): Promise<LocalEmotionLog[]> {
  const logs = await loadEmotionLogs();
  return logs.filter(l => l.pupil_id === pupilId);
}

// ─── Clear all local data ───────────────────────────────────────────

export async function clearAllLocalData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (err) {
    console.warn('[Storage] Failed to clear data:', err);
  }
}

// ─── Export keys for debugging ──────────────────────────────────────

export { KEYS as STORAGE_KEYS };
