import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const ACCESS_KEY = '@cobie_manc50_access';
const PENDING_TOKEN_KEY = '@cobie_manc50_pending_activation';

type Manc50Access = { entitlementId: string; expiresAt: string };

export async function saveManc50Access(access: Manc50Access): Promise<void> {
  await AsyncStorage.setItem(ACCESS_KEY, JSON.stringify(access));
}

export async function savePendingManc50Token(token: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_TOKEN_KEY, token);
}

export async function loadPendingManc50Token(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(PENDING_TOKEN_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function clearPendingManc50Token(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_TOKEN_KEY);
}

async function loadManc50Access(): Promise<Manc50Access | null> {
  try {
    const raw = await AsyncStorage.getItem(ACCESS_KEY);
    return raw ? JSON.parse(raw) as Manc50Access : null;
  } catch {
    return null;
  }
}

export async function recordManc50Use(
  eventName: 'first_value' | 'qualifying_use',
  lessonId: string,
  verifiedEntitlementId?: string,
): Promise<void> {
  const localAccess = verifiedEntitlementId ? null : await loadManc50Access();
  if (!verifiedEntitlementId && (!localAccess || new Date(localAccess.expiresAt).getTime() <= Date.now())) return;
  const entitlementId = verifiedEntitlementId ?? localAccess?.entitlementId;
  if (!entitlementId) return;
  const today = new Date().toISOString().slice(0, 10);
  const idempotencyKey = eventName === 'first_value'
    ? `pilot:first_value:${entitlementId}`
    : `lesson:${eventName}:${entitlementId}:${today}:${lessonId}`;
  const { error } = await supabase.functions.invoke('manc50-event', {
    body: {
      entitlement_id: entitlementId,
      event_name: eventName,
      idempotency_key: idempotencyKey,
    },
  });
  if (error) console.warn('MANC50 measurement event was not recorded:', error.message);
}
