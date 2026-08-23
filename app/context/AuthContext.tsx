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
  hasFullAccess: boolean;
  setHasFullAccess: (value: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  signUp: (email: string, password: string, name: string, school: string, role: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearUserData: () => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<TeacherProfile>) => Promise<void>;
  toggleFavourite: (resourceType: 'lesson' | 'activity' | 'printable', resourceId: string) => Promise<void>;
  isFavourite: (resourceType: string, resourceId: string) => boolean;
  markLessonComplete: (lessonId: string) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  saveCalmConfig: (config: { name: string; emotion: string; noise: string; time_available: number }) => Promise<void>;
  deleteCalmConfig: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const TESTER_EMAILS = ['caroline_marklew@hotmail.com', 'mand1984@yahoo.co.uk'];
const SESSION_TIMEOUT_MS = 8000;
const USER_DATA_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: PromiseLike<T>, milliseconds: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out`));
    }, milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [savedCalmConfigs, setSavedCalmConfigs] = useState<SavedCalmConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const resetAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setFavourites([]);
    setCompletedLessons([]);
    setSavedCalmConfigs([]);
    setHasFullAccess(false);
    setShowProfileModal(false);
  }, []);

  const getStorageUserId = useCallback(() => {
    return user?.id ?? undefined;
  }, [user]);

  useEffect(() => {
    setHasFullAccess(Boolean(user?.email && TESTER_EMAILS.includes(user.email)));
  }, [user]);

  const loadAndMergeUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .single();

      setProfile(profileData ?? null);

      const [favRes, compRes, calmRes] = await Promise.all([
        supabase.from('favourites').select('id, resource_type, resource_id').eq('user_id', userId),
        supabase.from('completed_lessons').select('lesson_id, completed_at').eq('user_id', userId),
        supabase.from('saved_calm_configs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      const cloudFavs: Favourite[] = favRes.data || [];
      const cloudLessons: CompletedLesson[] = compRes.data || [];
      const cloudConfigs: SavedCalmConfig[] = calmRes.data || [];

      const [localFavs, localLessons, localConfigs] = await Promise.all([
        LocalStorage.loadFavourites(),
        LocalStorage.loadCompletedLessons(),
        LocalStorage.loadCalmConfigs(),
      ]);

      const mergedFavs = [...cloudFavs];
      for (const localFav of localFavs) {
        const existsInCloud = cloudFavs.some(
          (cloudFav) =>
            cloudFav.resource_type === localFav.resource_type &&
            cloudFav.resource_id === localFav.resource_id
        );

        if (!existsInCloud) {
          try {
            const { data } = await supabase
              .from('favourites')
              .insert({
                user_id: userId,
                resource_type: localFav.resource_type,
                resource_id: localFav.resource_id,
              })
              .select('id, resource_type, resource_id')
              .single();

            if (data) {
              mergedFavs.push(data);
            }
          } catch {
            // Ignore merge failures and keep going.
          }
        }
      }

      const mergedLessons = [...cloudLessons];
      for (const localLesson of localLessons) {
        const existsInCloud = cloudLessons.some((cloudLesson) => cloudLesson.lesson_id === localLesson.lesson_id);

        if (!existsInCloud) {
          try {
            const { data } = await supabase
              .from('completed_lessons')
              .insert({
                user_id: userId,
                lesson_id: localLesson.lesson_id,
              })
              .select('lesson_id, completed_at')
              .single();

            if (data) {
              mergedLessons.push(data);
            }
          } catch {
            // Ignore merge failures and keep going.
          }
        }
      }

      const mergedConfigs = [...cloudConfigs];
      for (const localConfig of localConfigs) {
        const existsInCloud = cloudConfigs.some((cloudConfig) => cloudConfig.name === localConfig.name);

        if (!existsInCloud) {
          try {
            const { data } = await supabase
              .from('saved_calm_configs')
              .insert({
                user_id: userId,
                name: localConfig.name,
                emotion: localConfig.emotion,
                noise: localConfig.noise,
                time_available: localConfig.time_available,
              })
              .select('*')
              .single();

            if (data) {
              mergedConfigs.push(data);
            }
          } catch {
            // Ignore merge failures and keep going.
          }
        }
      }

      setFavourites(mergedFavs);
      setCompletedLessons(mergedLessons);
      setSavedCalmConfigs(mergedConfigs);

      await Promise.all([
        LocalStorage.saveFavourites(mergedFavs, userId),
        LocalStorage.saveCompletedLessons(mergedLessons, userId),
        LocalStorage.saveCalmConfigs(mergedConfigs, userId),
        LocalStorage.clearAllLocalData(null),
      ]);
    } catch (err) {
      console.error('Error loading/merging user data:', err);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      try {
        const {
          data: { session },
        } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS,
          'Session check',
        );

        if (!active) {
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await withTimeout(
            loadAndMergeUserData(session.user.id),
            USER_DATA_TIMEOUT_MS,
            'User data load',
          );
        } else {
          resetAuthState();
        }
      } catch (err) {
        console.warn('Session check failed:', err);
        if (active) {
          resetAuthState();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) {
        return;
      }

      if (session?.user) {
        setUser(session.user);
        try {
          await withTimeout(
            loadAndMergeUserData(session.user.id),
            USER_DATA_TIMEOUT_MS,
            'User data load',
          );
        } catch (err) {
          console.warn('User data load failed:', err);
        }
      } else {
        resetAuthState();
        await LocalStorage.clearAllLocalData(null);
      }

      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadAndMergeUserData, resetAuthState]);

  const signUp = async (email: string, password: string, name: string, school: string, role: string) => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      await LocalStorage.clearAllLocalData(getStorageUserId());
      resetAuthState();

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('teachers').insert({
          user_id: data.user.id,
          name,
          school,
          role,
        });

        if (profileError) {
          return { error: profileError.message };
        }
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }

      setShowAuthModal(false);
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const isWeb = typeof window !== 'undefined' && typeof window.location?.origin === 'string';
      const redirectTo = isWeb
        ? `${window.location.origin}/reset-password`
        : 'education-resources-support://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const currentUserId = getStorageUserId();
    setLoading(true);

    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      resetAuthState();
      setShowAuthModal(false);
      await LocalStorage.clearAllLocalData(currentUserId);
      await LocalStorage.clearAllLocalData(null);
      setLoading(false);
    }
  };

  const clearUserData = async () => {
    if (!user) {
      return { error: 'You need to be signed in to delete your data.' };
    }

    const currentUserId = user.id;
    setLoading(true);

    try {
      const deleteOperations = [
        supabase.from('tracker_emotion_logs').delete().eq('user_id', currentUserId),
        supabase.from('tracker_assessments').delete().eq('user_id', currentUserId),
        supabase.from('tracker_pupils').delete().eq('user_id', currentUserId),
        supabase.from('favourites').delete().eq('user_id', currentUserId),
        supabase.from('completed_lessons').delete().eq('user_id', currentUserId),
        supabase.from('saved_calm_configs').delete().eq('user_id', currentUserId),
        supabase.from('teachers').delete().eq('user_id', currentUserId),
      ];

      const results = await Promise.all(deleteOperations);
      const firstError = results.find((result) => result.error)?.error;

      if (firstError) {
        return { error: firstError.message };
      }

      resetAuthState();
      setShowAuthModal(false);
      await LocalStorage.clearAllLocalData(currentUserId);
      await LocalStorage.clearAllLocalData(null);
      await supabase.auth.signOut({ scope: 'global' });

      return { error: null };
    } catch (error: any) {
      return { error: error?.message || 'Failed to delete your data.' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<TeacherProfile>) => {
    if (!user) {
      return;
    }

    const { error } = await supabase.from('teachers').update(data).eq('user_id', user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...data });
    }
  };

  const toggleFavourite = async (resourceType: 'lesson' | 'activity' | 'printable', resourceId: string) => {
    const existing = favourites.find(
      (favourite) =>
        favourite.resource_type === resourceType && favourite.resource_id === resourceId
    );

    if (existing) {
      if (user && !existing.id.startsWith('local_')) {
        try {
          await supabase.from('favourites').delete().eq('id', existing.id);
        } catch {
          // Continue with local removal.
        }
      }

      const updated = favourites.filter((favourite) => favourite.id !== existing.id);
      setFavourites(updated);
      await LocalStorage.saveFavourites(updated, getStorageUserId());
      return;
    }

    let newFav: Favourite;
    if (user) {
      try {
        const { data } = await supabase
          .from('favourites')
          .insert({
            user_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
          })
          .select('id, resource_type, resource_id')
          .single();

        newFav = data || {
          id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
          resource_type: resourceType,
          resource_id: resourceId,
        };
      } catch {
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
    await LocalStorage.saveFavourites(updated, getStorageUserId());
  };

  const isFavourite = (resourceType: string, resourceId: string) => {
    return favourites.some(
      (favourite) =>
        favourite.resource_type === resourceType && favourite.resource_id === resourceId
    );
  };

  const markLessonComplete = async (lessonId: string) => {
    const existing = completedLessons.find((lesson) => lesson.lesson_id === lessonId);
    if (existing) {
      return;
    }

    let newEntry: CompletedLesson;
    if (user) {
      try {
        const { data } = await supabase
          .from('completed_lessons')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
          })
          .select('lesson_id, completed_at')
          .single();

        newEntry = data || { lesson_id: lessonId, completed_at: new Date().toISOString() };
      } catch {
        newEntry = { lesson_id: lessonId, completed_at: new Date().toISOString() };
      }
    } else {
      newEntry = { lesson_id: lessonId, completed_at: new Date().toISOString() };
    }

    const updated = [...completedLessons, newEntry];
    setCompletedLessons(updated);
    await LocalStorage.saveCompletedLessons(updated, getStorageUserId());
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.some((lesson) => lesson.lesson_id === lessonId);
  };

  const saveCalmConfig = async (config: { name: string; emotion: string; noise: string; time_available: number }) => {
    let newConfig: SavedCalmConfig;
    if (user) {
      try {
        const { data } = await supabase
          .from('saved_calm_configs')
          .insert({
            user_id: user.id,
            ...config,
          })
          .select('*')
          .single();

        newConfig = data || {
          id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
          ...config,
          created_at: new Date().toISOString(),
        };
      } catch {
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
    await LocalStorage.saveCalmConfigs(updated, getStorageUserId());
  };

  const deleteCalmConfig = async (id: string) => {
    if (user && !id.startsWith('local_')) {
      try {
        await supabase.from('saved_calm_configs').delete().eq('id', id);
      } catch {
        // Continue with local removal.
      }
    }

    const updated = savedCalmConfigs.filter((config) => config.id !== id);
    setSavedCalmConfigs(updated);
    await LocalStorage.saveCalmConfigs(updated, getStorageUserId());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        favourites,
        completedLessons,
        savedCalmConfigs,
        loading,
        hasFullAccess,
        setHasFullAccess,
        showAuthModal,
        setShowAuthModal,
        showProfileModal,
        setShowProfileModal,
        signUp,
        signIn,
        resetPassword,
        signOut,
        clearUserData,
        updateProfile,
        toggleFavourite,
        isFavourite,
        markLessonComplete,
        isLessonCompleted,
        saveCalmConfig,
        deleteCalmConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
