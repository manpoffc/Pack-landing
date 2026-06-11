'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/adminAuth';

// Defense-in-depth: middleware already gates /admin/*, but server actions
// wield the service-role key — re-verify the admin cookie inside every action.
async function requireAdmin() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  const token = cookies().get('pack_admin')?.value;
  if (!secret || !token || !(await verifyToken(token, secret))) {
    throw new Error('Not authorized');
  }
}

export async function pullDeal(formData: FormData) {
  await requireAdmin();
  const itemId = formData.get('item_id') as string;
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('admin_set_deal_disabled', {
    p_item_id: itemId,
    p_disabled: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/deals');
}

export async function restoreDeal(formData: FormData) {
  await requireAdmin();
  const itemId = formData.get('item_id') as string;
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('admin_set_deal_disabled', {
    p_item_id: itemId,
    p_disabled: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/deals');
}
