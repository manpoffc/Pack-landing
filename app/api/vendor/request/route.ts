import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/resend';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// Public "Request a vendor invite" form handler. Saves the request to
// vendor_requests (service role) AND emails the team so an admin can follow up
// and issue a real invite via /admin/vendors. Resilient by design: if EITHER
// the DB insert or the email succeeds we return success, so the form still
// works before the m43 table exists or if Resend is briefly down.

type Body = {
  business_name?: string;
  email?: string;
  city?: string;
  website_url?: string;
  what_they_sell?: string;
};

const NOTIFY_TO = process.env.VENDOR_NOTIFY_TO ?? 'hello@trypack.app';

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests from this IP, try again later' },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const businessName = body.business_name?.trim();
  const email = body.email?.trim().toLowerCase();
  const city = body.city?.trim() || null;
  const website = body.website_url?.trim() || null;
  const whatTheySell = body.what_they_sell?.trim() || null;

  if (!businessName) {
    return NextResponse.json({ error: 'business name required' }, { status: 400 });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  let dbOk = false;
  let emailOk = false;

  // 1. Persist (best-effort — table may not exist yet pre-m43).
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('vendor_requests').insert({
      business_name: businessName,
      contact_email: email,
      city,
      website_url: website,
      what_they_sell: whatTheySell,
      ip_address: ip,
      user_agent: req.headers.get('user-agent') ?? null,
    });
    if (error) throw new Error(error.message);
    dbOk = true;
  } catch (err) {
    console.error('[vendor/request] db insert failed:', err);
  }

  // 2. Notify the team (best-effort).
  try {
    const lines = [
      `Business: ${businessName}`,
      `Email: ${email}`,
      `City: ${city ?? '—'}`,
      `Website: ${website ?? '—'}`,
      `What they sell: ${whatTheySell ?? '—'}`,
      ``,
      `IP: ${ip ?? '—'}`,
    ];
    await sendEmail({
      to: NOTIFY_TO,
      subject: `New vendor invite request — ${businessName}`,
      text: lines.join('\n'),
      html:
        `<h2>New vendor invite request</h2>` +
        lines.map((l) => (l ? `<p style="margin:2px 0">${esc(l)}</p>` : '<br/>')).join('') +
        `<p style="margin-top:12px">Follow up and issue an invite from <a href="https://trypack.app/admin/vendors">/admin/vendors</a>.</p>`,
    });
    emailOk = true;
  } catch (err) {
    console.error('[vendor/request] email send failed:', err);
  }

  if (!dbOk && !emailOk) {
    return NextResponse.json(
      { error: 'could not submit your request, please email hello@trypack.app' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
