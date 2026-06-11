import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { vendorServerClient } from '@/lib/supabaseVendor';

export const dynamic = 'force-dynamic';

// Helper to decode a base64 data URL and return raw bytes + mime type.
function parseDataUrl(
  dataUrl: string,
): { buffer: Buffer; mimeType: string; ext: string } | null {
  const match = dataUrl.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return { buffer, mimeType, ext };
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    token,
    vendorId,
    email,
    password,
    business_name,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    website_url,
    online_store,
    logo_base64,
    logo_filename,
    contact_name,
    contact_email,
    contact_phone,
  } = body as {
    token?: string;
    vendorId?: string;
    email?: string;
    password?: string;
    business_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    website_url?: string | null;
    online_store?: boolean;
    logo_base64?: string | null;
    logo_filename?: string | null;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string | null;
  };

  // ── Basic validation ──────────────────────────────────────────────────────

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }
  if (!email || !password || !business_name || !address_line1 || !city) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // ── Defense-in-depth: re-validate token ──────────────────────────────────

  const { data: invite, error: inviteError } = await admin
    .from('vendor_invites')
    .select('email, business_name, expires_at, accepted_at, vendor_id')
    .eq('token', token)
    .single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invalid invite token.' }, { status: 400 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'This invite has already been used.' }, { status: 400 });
  }
  if (new Date() > new Date(invite.expires_at)) {
    return NextResponse.json({ error: 'This invite link has expired.' }, { status: 400 });
  }

  const resolvedVendorId = (vendorId ?? invite.vendor_id) as string;

  // ── Create auth user ──────────────────────────────────────────────────────

  const { data: authData, error: createUserError } =
    await admin.auth.admin.createUser({
      email: email as string,
      password: password as string,
      email_confirm: true,
    });

  if (createUserError) {
    const msg = createUserError.message ?? '';
    if (
      msg.toLowerCase().includes('already') ||
      msg.toLowerCase().includes('exists')
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      );
    }
    console.error('[vendor/onboard] createUser error:', createUserError);
    return NextResponse.json(
      { error: 'Could not create account. Please try again.' },
      { status: 500 },
    );
  }

  const newUserId = authData.user.id;

  // ── Upload logo (if provided) ─────────────────────────────────────────────

  let logoUrl: string | null = null;

  if (logo_base64 && typeof logo_base64 === 'string') {
    const parsed = parseDataUrl(logo_base64);
    if (parsed) {
      const { buffer, mimeType, ext } = parsed;
      const path = `${resolvedVendorId}/logo.${ext}`;
      const { error: uploadError } = await admin.storage
        .from('vendor-logos')
        .upload(path, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error('[vendor/onboard] logo upload error:', uploadError);
        // Non-fatal — proceed without logo.
      } else {
        const { data: publicUrlData } = admin.storage
          .from('vendor-logos')
          .getPublicUrl(path);
        logoUrl = publicUrlData.publicUrl ?? null;
      }
    }
  }

  // ── Call accept_vendor_invite RPC ─────────────────────────────────────────

  const { error: rpcError } = await admin.rpc('accept_vendor_invite', {
    p_token: token,
    p_auth_user_id: newUserId,
    p_business_name: business_name,
    p_address_line1: address_line1,
    p_address_line2: (address_line2 as string | undefined) ?? null,
    p_city: city,
    p_state: (state as string | undefined) ?? null,
    p_postal_code: (postal_code as string | undefined) ?? null,
    p_country: (country as string | undefined) ?? null,
    p_lat: null,
    p_lng: null,
    p_website_url: website_url ?? null,
    p_online_store: online_store ?? false,
    p_logo_url: logoUrl,
    p_contact_name: (contact_name as string | undefined) ?? null,
    p_contact_email: (contact_email as string | undefined) ?? null,
    p_contact_phone: (contact_phone as string | undefined) ?? null,
  });

  if (rpcError) {
    console.error('[vendor/onboard] accept_vendor_invite error:', rpcError);
    // Orphan cleanup: delete the auth user we just created.
    await admin.auth.admin.deleteUser(newUserId);
    return NextResponse.json(
      { error: 'Registration failed. The invite may have already been used. Please contact hello@trypack.app.' },
      { status: 400 },
    );
  }

  // ── Sign the user in (set auth cookies) ───────────────────────────────────
  // Use vendorServerClient (cookie-writing) so the redirect to /vendor is
  // authenticated immediately.

  const serverClient = vendorServerClient();
  const { error: signInError } = await serverClient.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  if (signInError) {
    // Registration succeeded but sign-in failed — user can sign in manually.
    console.error('[vendor/onboard] signIn after registration failed:', signInError);
    return NextResponse.json(
      { ok: true, redirect: '/vendor/login' },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
