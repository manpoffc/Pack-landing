'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/adminAuth';
import { inviteVendor } from '../vendors/actions';

// Defense-in-depth: middleware gates /admin/*, but these actions use the
// service-role key — re-verify the admin cookie inside each one.
async function requireAdmin() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  const token = cookies().get('pack_admin')?.value;
  if (!secret || !token || !(await verifyToken(token, secret))) {
    throw new Error('Not authorized');
  }
}

const ALLOWED = ['new', 'contacted', 'invited', 'declined'] as const;

// One-click: turn a request into a real vendor invite, then mark it invited.
// Reuses the canonical inviteVendor flow (creates the vendor + invite row and
// sends the onboarding email) so there's a single source of truth for invites.
export async function inviteFromRequest(formData: FormData) {
  await requireAdmin();
  const requestId = formData.get('request_id') as string | null;
  if (!requestId) throw new Error('request_id required');

  const sb = supabaseAdmin();
  const { data: reqRow, error: reqErr } = await sb
    .from('vendor_requests')
    .select('id, business_name, contact_email')
    .eq('id', requestId)
    .single();
  if (reqErr) throw new Error(reqErr.message);

  const fd = new FormData();
  fd.set('email', reqRow.contact_email as string);
  fd.set('business_name', reqRow.business_name as string);
  await inviteVendor(fd);

  const { error: updErr } = await sb
    .from('vendor_requests')
    .update({ status: 'invited' })
    .eq('id', requestId);
  if (updErr) throw new Error(updErr.message);

  revalidatePath('/admin/vendor-requests');
}

// Mark a request contacted / declined / back to new without inviting.
export async function markRequestStatus(formData: FormData) {
  await requireAdmin();
  const requestId = formData.get('request_id') as string | null;
  const status = formData.get('status') as string | null;
  if (!requestId) throw new Error('request_id required');
  if (!status || !ALLOWED.includes(status as (typeof ALLOWED)[number])) {
    throw new Error('invalid status');
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from('vendor_requests')
    .update({ status })
    .eq('id', requestId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/vendor-requests');
}
