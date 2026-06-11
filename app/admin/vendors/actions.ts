'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/adminAuth';
import { newInviteToken } from '@/lib/inviteToken';
import { sendEmail } from '@/lib/resend';

// Defense-in-depth: middleware already gates /admin/*, but server actions
// wield the service-role key — re-verify the admin cookie inside every action.
async function requireAdmin() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  const token = cookies().get('pack_admin')?.value;
  if (!secret || !token || !(await verifyToken(token, secret))) {
    throw new Error('Not authorized');
  }
}

export async function inviteVendor(formData: FormData) {
  await requireAdmin();

  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const businessName = (formData.get('business_name') as string | null)?.trim() ?? '';

  if (!email || !businessName) throw new Error('Email and business name are required');

  const sb = supabaseAdmin();

  // 1. Create vendor row (status = 'invited')
  const { data: vendorData, error: vendorErr } = await sb
    .from('vendors')
    .insert({ business_name: businessName, contact_email: email, status: 'invited' })
    .select('id')
    .single();

  if (vendorErr) throw new Error(vendorErr.message);
  const vendorId = vendorData.id as string;

  // 2. Create vendor_invites row (expires 14 days from now)
  const token = newInviteToken();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error: inviteErr } = await sb
    .from('vendor_invites')
    .insert({
      token,
      email,
      business_name: businessName,
      vendor_id: vendorId,
      expires_at: expiresAt,
    });

  if (inviteErr) throw new Error(inviteErr.message);

  // 3. Send invite email — failure is soft (row already saved, admin can copy link manually).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trypack.app';
  const onboardingLink = `${siteUrl}/vendor/onboard?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "You're invited to sell on Pack",
      html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2c1a0e;">
  <h2 style="font-size:22px;margin-bottom:8px;">You're invited to sell on Pack!</h2>
  <p style="margin-bottom:12px;">
    Hi there — Pack is a community-first platform for dog owners, and we'd love to have
    <strong>${businessName}</strong> as a vendor.
  </p>
  <p style="margin-bottom:20px;">
    Click the link below to set up your vendor account and start listing products for our
    dog-loving community.
  </p>
  <a href="${onboardingLink}"
     style="display:inline-block;background:#d44c1a;color:#fff;font-weight:600;
            padding:12px 24px;border-radius:8px;text-decoration:none;margin-bottom:24px;">
    Set up your vendor account
  </a>
  <p style="font-size:13px;color:#6b4f3a;margin-bottom:8px;">
    This link expires in 14 days. If you didn't request this invitation, you can safely ignore it.
  </p>
  <p style="font-size:12px;color:#9a7a5a;border-top:1px solid #e8dcc8;padding-top:12px;">
    Note: Pack reserves the right to suspend or cancel vendor memberships at any time
    in accordance with our vendor terms of service.
  </p>
</div>
`,
      text: `You're invited to sell on Pack!

Hi there — Pack is a community-first platform for dog owners, and we'd love to have ${businessName} as a vendor.

Click the link below to set up your vendor account:
${onboardingLink}

This link expires in 14 days.

Note: Pack reserves the right to suspend or cancel vendor memberships at any time in accordance with our vendor terms of service.
`,
    });
  } catch (emailErr) {
    // Email send failed — the invite row is preserved so the admin can share the link manually.
    // We do NOT rethrow; the invite will appear in the UI with a copy-link button.
    console.error('[inviteVendor] email send failed:', emailErr);
  }

  revalidatePath('/admin/vendors');
}

export async function suspendVendor(formData: FormData) {
  await requireAdmin();
  const vendorId = formData.get('vendor_id') as string;
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('set_vendor_status', {
    p_vendor_id: vendorId,
    p_status: 'suspended',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/vendors');
}

export async function cancelVendor(formData: FormData) {
  await requireAdmin();
  const vendorId = formData.get('vendor_id') as string;
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('set_vendor_status', {
    p_vendor_id: vendorId,
    p_status: 'cancelled',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/vendors');
}

export async function reactivateVendor(formData: FormData) {
  await requireAdmin();
  const vendorId = formData.get('vendor_id') as string;
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('set_vendor_status', {
    p_vendor_id: vendorId,
    p_status: 'active',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/vendors');
}
