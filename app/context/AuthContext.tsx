import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/app/lib/supabase';
import * as LocalStorage from '@/app/lib/storage';

export interface TeacherProfile {
  id: string;
  user_id: string;
  name: string;
  school: string;
  role: string;
  created_at: string;
}

export interface Favourite {
  id: string;
  resource_type: 'lesson' | 'activity' | 'printable';
  resource_id: string;
}

export interface CompletedLesson {
  lesson_id: string;
  completed_at: string;
}

export interface SavedCalmConfig {
  id: string;
  name: string;
  emotion: string;
  noise: string;
  time_available: number;
  created_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: TeacherProfile | null;
  favourites: Favourite[];
  completedLessons: CompletedLesson[];
  savedCalmConfigs: SavedCalmConfig[];
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  signUp: (email: string, password: string, name: string, school: string, role: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<TeacherProfile>) => Promise<void>;
  toggleFavourite: (resourceType: 'lesson' | 'activity' | 'printable', resourceId: string) => Promise<void>;
  isFavourite: (resourceType: string, resourceId: string) => boolean;
  markLessonComplete: (lessonId: string) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  saveCalmConfig: (config: { name: string; emotion: string; noise: string; time_available: number }) => Promise<void>;
  deleteCalmConfig: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [savedCalmConfigs, setSavedCalmConfigs] = useState<SavedCalmConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [localDataLoaded, setLocalDataLoaded] = useState(false);

  // ─── Load local data on mount (works without auth) ──────────────
  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = useCallback(async () => {
    try {
      const [localFavs, localLessons, localConfigs] = await Promise.all([
        LocalStorage.loadFavourites(),
        LocalStorage.loadCompletedLessons(),
        LocalStorage.loadCalmConfigs(),
      ]);
      setFavourites(localFavs);
      setCompletedLessons(localLessons);
      setSavedCalmConfigs(localConfigs);
      setLocalDataLoaded(true);
    } catch (err) {
      console.error('Error loading local data:', err);
      setLocalDataLoaded(true);
    }
  }, []);

  // ─── Listen for auth changes ────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAndMergeUserData(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAndMergeUserData(session.user.id);
      } else {
        // User logged out — reload local data so they keep their local progress
        loadLocalData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Load Supabase data AND merge local data into cloud ─────────
  const loadAndMergeUserData = useCallback(async (userId: string) => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (profileData) setProfile(profileData);

      // Load cloud data
      const [favRes, compRes, calmRes] = await Promise.all([
        supabase.from('favourites').select('id, resource_type, resource_id').eq('user_id', userId),
        supabase.from('completed_lessons').select('lesson_id, completed_at').eq('user_id', userId),
        supabase.from('saved_calm_configs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      const cloudFavs: Favourite[] = favRes.data || [];
      const cloudLessons: CompletedLesson[] = compRes.data || [];
      const cloudConfigs: SavedCalmConfig[] = calmRes.data || [];

      // Load local data to merge
      const [localFavs, localLessons, localConfigs] = await Promise.all([
        LocalStorage.loadFavourites(),
        LocalStorage.loadCompletedLessons(),
        LocalStorage.loadCalmConfigs(),
      ]);

      // ── Merge local favourites → cloud ──
      const mergedFavs = [...cloudFavs];
      for (const localFav of localFavs) {
        const existsInCloud = cloudFavs.some(
          cf => cf.resource_type === localFav.resource_type && cf.resource_id === localFav.resource_id
        );
        if (!existsInCloud) {
          try {
            const { data } = await supabase.from('favourites').insert({
              user_id: userId,
              resource_type: localFav.resource_type,
              resource_id: localFav.resource_id,
            }).select('id, resource_type, resource_id').single();
            if (data) mergedFavs.push(data);
          } catch (err) {
            // Silently skip merge errors
          }
        }
      }

      // ── Merge local completed lessons → cloud ──
      const mergedLessons = [...cloudLessons];
      for (const localLesson of localLessons) {
        const existsInCloud = cloudLessons.some(cl => cl.lesson_id === localLesson.lesson_id);
        if (!existsInCloud) {
          try {
            const { data } = await supabase.from('completed_lessons').insert({
              user_id: userId,
              lesson_id: localLesson.lesson_id,
            }).select('lesson_id, completed_at').single();
            if (data) mergedLessons.push(data);
          } catch (err) {
            // Silently skip merge errors
          }
        }
      }

      // ── Merge local calm configs → cloud ──
      const mergedConfigs = [...cloudConfigs];
      for (const localConfig of localConfigs) {
        // Only merge configs that don't already exist by name
        const existsInCloud = cloudConfigs.some(cc => cc.name === localConfig.name);
        if (!existsInCloud) {
          try {
            const { data } = await supabase.from('saved_calm_configs').insert({
              user_id: userId,
              name: localConfig.name,
              emotion: localConfig.emotion,
              noise: localConfig.noise,
              time_available: localConfig.time_available,
            }).select('*').single();
            if (data) mergedConfigs.push(data);
          } catch (err) {
            // Silently skip merge errors
          }
        }
      }

      // Update state with merged data
      setFavourites(mergedFavs);
      setCompletedLessons(mergedLessons);
      setSavedCalmConfigs(mergedConfigs);

      // Sync merged data back to local storage (so it persists if they log out)
      await Promise.all([
        LocalStorage.saveFavourites(mergedFavs),
        LocalStorage.saveCompletedLessons(mergedLessons),
        LocalStorage.saveCalmConfigs(mergedConfigs),
      ]);
    } catch (err) {
      console.error('Error loading/merging user data:', err);
    }
  }, []);

  const signUp = async (email: string, password: string, name: string, school: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase.from('teachers').insert({
        user_id: data.user.id,
        name,
        school,
        role,
      });
      if (profileError) return { error: profileError.message };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    // Don't clear local data on sign out — keep it for offline use
    // Just reload from local storage
    await loadLocalData();
  };

  const updateProfile = async (data: Partial<TeacherProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from('teachers')
      .update(data)
      .eq('user_id', user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...data });
    }
  };

  // ─── Toggle favourite (works locally OR with cloud) ─────────────
  const toggleFavourite = async (resourceType: 'lesson' | 'activity' | 'printable', resourceId: string) => {
    const existing = favourites.find(f => f.resource_type === resourceType && f.resource_id === resourceId);

    if (existing) {
      // Remove favourite
      if (user) {
        try {
          await supabase.from('favourites').delete().eq('id', existing.id);
        } catch (err) {
          // Continue with local removal even if cloud fails
        }
      }
      const updated = favourites.filter(f => f.id !== existing.id);
      setFavourites(updated);
      await LocalStorage.saveFavourites(updated);
    } else {
      // Add favourite
      let newFav: Favourite;
      if (user) {
        try {
          const { data } = await supabase.from('favourites').insert({
            user_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
          }).select('id, resource_type, resource_id').single();
          newFav = data || {
            id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
            resource_type: resourceType,
            resource_id: resourceId,
          };
        } catch (err) {
          newFav = {
            id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
            resource_type: resourceType,
            resource_id: resourceId,
          };
        }
      } else {
        newFav = {
          id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
          resource_type: resourceType,
          resource_id: resourceId,
        };
      }
      const updated = [...favourites, newFav];
      setFavourites(updated);
      await LocalStorage.saveFavourites(updated);
    }
  };

  const isFavourite = (resourceType: string, resourceId: string) => {
    return favourites.some(f => f.resource_type === resourceType && f.resource_id === resourceId);
  };

  // ─── Mark lesson complete (works locally OR with cloud) ─────────
  const markLessonComplete = async (lessonId: string) => {
    const existing = completedLessons.find(c => c.lesson_id === lessonId);
    if (existing) return;

    let newEntry: CompletedLesson;
    if (user) {
      try {
        const { data } = await supabase.from('completed_lessons').insert({
          user_id: user.id,
          lesson_id: lessonId,
        }).select('lesson_id, completed_at').single();
        newEntry = data || { lesson_id: lessonId, completed_at: new Date().toISOString() };
      } catch (err) {
        newEntry = { lesson_id: lessonId, completed_at: new Date().toISOString() };
      }
    } else {
      newEntry = { lesson_id: lessonId, completed_at: new Date().toISOString() };
    }

    const updated = [...completedLessons, newEntry];
    setCompletedLessons(updated);
    await LocalStorage.saveCompletedLessons(updated);
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.some(c => c.lesson_id === lessonId);
  };

  // ─── Save calm config (works locally OR with cloud) ─────────────
  const saveCalmConfig = async (config: { name: string; emotion: string; noise: string; time_available: number }) => {
    let newConfig: SavedCalmConfig;
    if (user) {
      try {
        const { data } = await supabase.from('saved_calm_configs').insert({
          user_id: user.id,
          ...config,
        }).select('*').single();
        newConfig = data || {
          id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
          ...config,
          created_at: new Date().toISOString(),
        };
      } catch (err) {
        newConfig = {
          id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
          ...config,
          created_at: new Date().toISOString(),
        };
      }
    } else {
      newConfig = {
        id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
        ...config,
        created_at: new Date().toISOString(),
      };
    }

    const updated = [newConfig, ...savedCalmConfigs];
    setSavedCalmConfigs(updated);
    await LocalStorage.saveCalmConfigs(updated);
  };

  // ─── Delete calm config (works locally OR with cloud) ───────────
  const deleteCalmConfig = async (id: string) => {
    if (user && !id.startsWith('local_')) {
      try {
        await supabase.from('saved_calm_configs').delete().eq('id', id);
      } catch (err) {
        // Continue with local removal
      }
    }
    const updated = savedCalmConfigs.filter(c => c.id !== id);
    setSavedCalmConfigs(updated);
    await LocalStorage.saveCalmConfigs(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      favourites,
      completedLessons,
      savedCalmConfigs,
      loading,
      showAuthModal,
      setShowAuthModal,
      showProfileModal,
      setShowProfileModal,
      signUp,
      signIn,
      signOut,
      updateProfile,
      toggleFavourite,
      isFavourite,
      markLessonComplete,
      isLessonCompleted,
      saveCalmConfig,
      deleteCalmConfig,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
