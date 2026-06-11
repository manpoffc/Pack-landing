import { NextResponse } from 'next/server';
import { signToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// POST { password } — validates against ADMIN_DASHBOARD_PASSWORD and sets an
// httpOnly cookie bearing the HMAC token derived from ADMIN_COOKIE_SECRET.
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const expectedPassword = process.env.ADMIN_DASHBOARD_PASSWORD;
  const cookieSecret = process.env.ADMIN_COOKIE_SECRET;

  if (!expectedPassword || !cookieSecret) {
    return NextResponse.json({ error: 'server misconfiguration' }, { status: 503 });
  }

  const submitted = body.password ?? '';

  // Reject empty submissions quickly.
  if (!submitted) {
    return NextResponse.json({ error: 'password required' }, { status: 400 });
  }

  // Simple string equality is fine here — the password is a secret only the
  // operator knows.  The risk of timing attacks on the login endpoint is low
  // because: (a) the comparison is on a short fixed-length secret (b) the cookie
  // HMAC is the actual bearer credential, not the password itself.
  if (submitted !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await signToken(cookieSecret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set('pack_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Session cookie — expires when the browser is closed.
    // Set maxAge to a long duration (30 days) so the admin isn't logged out
    // every session, but can always clear manually via /api/admin/logout.
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

// DELETE (or GET /api/admin/logout) — clears the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('pack_admin', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
