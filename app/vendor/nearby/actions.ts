'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getVendor } from '@/lib/vendorSession';
import { supabaseAdmin } from '@/lib/supabase';

// redirect() works by throwing a NEXT_REDIRECT error; a catch block must
// re-throw it or the navigation is lost.
function isRedirectError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'digest' in e &&
    typeof (e as { digest?: unknown }).digest === 'string' &&
    (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

async function requireVendorForAction() {
  const result = await getVendor();
  if (result.kind === 'no_session') redirect('/vendor/login');
  if (result.kind === 'not_a_vendor') throw new Error('Not a vendor');
  if (result.vendor.status !== 'active') throw new Error('Vendor account is not active');
  return result.vendor;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Manual lat/lng override — validates ranges and persists via service role.
 * (Auto-geocoding on first load is inlined in the page; this is the fallback
 * when geocoding the stored address fails.)
 */
export async function setVendorGeo(formData: FormData): Promise<ActionResult> {
  try {
    const vendor = await requireVendorForAction();

    const latStr = (formData.get('lat') as string | null)?.trim() ?? '';
    const lngStr = (formData.get('lng') as string | null)?.trim() ?? '';

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { ok: false, error: 'Latitude must be a number between -90 and 90.' };
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { ok: false, error: 'Longitude must be a number between -180 and 180.' };
    }

    const admin = supabaseAdmin();
    const { error } = await admin
      .from('vendors')
      .update({ lat, lng, geocoded_at: new Date().toISOString() })
      .eq('id', vendor.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/vendor/nearby');
    return { ok: true };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}
