/**
 * Server-side helper for reading the current vendor's session + DB record.
 *
 * Used by the /vendor layout and any server action that needs to know who the
 * vendor is and whether they are active.
 *
 * Auth split:
 *  - Session existence check: vendorServerClient() (anon key, reads JWT cookie)
 *  - Vendors table lookup:    supabaseAdmin() (service role, bypasses RLS)
 *    RLS on the `vendors` table restricts a vendor to their own row, so the
 *    anon client with a valid session would also work.  We use service role
 *    here for two reasons:
 *      1. Middleware / layout needs a reliable read that won't be affected by
 *         future RLS policy changes.
 *      2. Avoids an extra round-trip to refresh the JWT before the query.
 */

import { vendorServerClient } from '@/lib/supabaseVendor';
import { supabaseAdmin } from '@/lib/supabase';

export type VendorRow = {
  id: string;
  auth_user_id: string;
  status: 'invited' | 'active' | 'suspended' | 'cancelled';
  business_name: string;
  created_at: string;
  [key: string]: unknown;
};

export type GetVendorResult =
  | { kind: 'no_session' }
  | { kind: 'not_a_vendor' }
  | { kind: 'ok'; vendor: VendorRow; isActive: boolean };

/**
 * Returns the vendor record for the currently authenticated user, or a
 * discriminated union indicating why retrieval failed.
 *
 * Callers can distinguish three cases:
 *   'no_session'   — no Supabase auth session at all → redirect to /vendor/login
 *   'not_a_vendor' — authenticated user but no vendors row → show 403/error page
 *   'ok'           — authenticated vendor; check `isActive` for suspended/cancelled
 */
export async function getVendor(): Promise<GetVendorResult> {
  const supabase = vendorServerClient();

  // getUser() contacts the Auth server to validate the JWT — safer than
  // getSession() which only reads cookies without verification.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { kind: 'no_session' };
  }

  // Use service-role client for the vendors lookup (see module-level comment).
  const admin = supabaseAdmin();
  const { data: vendor, error: vendorError } = await admin
    .from('vendors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (vendorError || !vendor) {
    return { kind: 'not_a_vendor' };
  }

  return {
    kind: 'ok',
    vendor: vendor as VendorRow,
    isActive: vendor.status === 'active',
  };
}
