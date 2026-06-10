import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

type Body = {
  email?: string;
  referred_by_code?: string;
};

// Calls the join_waitlist RPC with the user's IP + user-agent baked in.
// Errors are surfaced as plain JSON; the rate limit returns 429.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: 'too many signups from this IP, try later' }, { status: 429 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc('join_waitlist', {
    p_email: email,
    p_name: null,
    p_phone: null,
    p_dog_name: null,
    p_referred_by_code: body.referred_by_code?.toUpperCase() || null,
    p_ip_address: ip,
    p_user_agent: req.headers.get('user-agent') ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = ((data as unknown[]) ?? [])[0];
  if (!row) return NextResponse.json({ error: 'no row returned' }, { status: 500 });
  return NextResponse.json(row);
}
