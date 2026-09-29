import { supabase } from '../app/lib/supabase';

export interface BillingStatus {
  hasFullAccess: boolean;
  status: string;
  canManageBilling: boolean;
  pilotEntitlementId?: string;
  pilotExpiresAt?: string;
}

async function billingRequest(action: 'status' | 'checkout' | 'portal') {
  if (typeof window === 'undefined') throw new Error('Please use the web app to manage your subscription.');
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Please sign in to continue.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`/api/billing?action=${action}`, {
      method: action === 'status' ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store', signal: controller.signal,
    });
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Billing is not available yet. Please try again later.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'We could not check your subscription. Please try again.');
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('The billing check timed out. Please try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const result = await billingRequest('status');
  if (typeof result.hasFullAccess !== 'boolean' || typeof result.canManageBilling !== 'boolean') {
    throw new Error('We could not verify your subscription. Please try again.');
  }
  if (result.status === 'pilot' && (typeof result.pilotEntitlementId !== 'string' || typeof result.pilotExpiresAt !== 'string')) {
    throw new Error('We could not verify your pilot access. Please try again.');
  }
  return result;
}

export async function openBilling(action: 'checkout' | 'portal'): Promise<void> {
  const result = await billingRequest(action);
  const url = new URL(result.url);
  if (url.protocol !== 'https:' || !['checkout.stripe.com', 'billing.stripe.com'].includes(url.hostname)) {
    throw new Error('We could not open secure billing. Please try again.');
  }
  window.location.assign(url.href);
}
