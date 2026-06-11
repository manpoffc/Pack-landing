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
    // Plain, transactional styling on purpose: a single link (no big marketing
    // button), conversational tone, and a strong text/plain part — this biases
    // Gmail toward the Primary tab rather than Promotions.
    await sendEmail({
      to: email,
      subject: `Set up your Pack vendor account`,
      html: `
<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#2c1a0e;font-size:15px;line-height:1.5;">
  <p>Hi ${businessName},</p>
  <p>You're set up to join Pack as a vendor. Use the link below to finish creating your account — set a password and confirm your business details:</p>
  <p><a href="${onboardingLink}" style="color:#b5410f;">${onboardingLink}</a></p>
  <p>The link expires in 14 days. If you weren't expecting this, you can ignore this email.</p>
  <p style="color:#6b4f3a;">— The Pack team</p>
  <p style="font-size:12px;color:#9a7a5a;margin-top:24px;">
    Pack may suspend or cancel vendor memberships at any time per our vendor terms.
  </p>
</div>
`,
      text: `Hi ${businessName},

You're set up to join Pack as a vendor. Use the link below to finish creating your account — set a password and confirm your business details:

${onboardingLink}

The link expires in 14 days. If you weren't expecting this, you can ignore this email.

— The Pack team

Pack may suspend or cancel vendor memberships at any time per our vendor terms.
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
