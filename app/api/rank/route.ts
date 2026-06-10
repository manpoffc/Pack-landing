import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET /api/rank?email=foo@bar.com → { rank, total, referral_count }
// rank is null if the email isn't on the waitlist. Rate-limited per IP:
// the member/non-member difference in the response makes this an email
// oracle, so lookups get the same budget as signups.
export async function GET(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(ip === null ? null : `rank:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: 'too many lookups from this IP, try later' }, { status: 429 });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc('waitlist_rank_for', { p_email: email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = ((data as unknown[]) ?? [])[0];
  if (!row) return NextResponse.json({ error: 'no row' }, { status: 500 });
  return NextResponse.json(row);
}
