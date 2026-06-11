/**
 * Edge middleware for /admin/* and /vendor/* route protection.
 *
 * Auth split between middleware and layout:
 *
 *   Middleware (/vendor/*):
 *     Checks only for the existence of a valid Supabase auth session (JWT in
 *     cookies). No session → redirect to /vendor/login.  This is fast and
 *     works on the edge without hitting the database.
 *
 *   Each authenticated /vendor page (e.g. app/vendor/page.tsx):
 *     Calls requireActiveVendor() (lib/vendorSession) which uses the
 *     service-role client to fetch the `vendors` row and check status
 *     (active / suspended / cancelled). NOTE: there is no app/vendor/layout.tsx
 *     enforcing this — every new /vendor/* page MUST call requireActiveVendor()
 *     itself, or add a route-group layout that does.
 *     This separation keeps the middleware thin (no service-role DB calls on
 *     the edge) while still guarding every /vendor/* request against
 *     unauthenticated access.
 *
 *   /admin/*:
 *     Uses a symmetric HMAC-SHA256 cookie (pack_admin) signed with
 *     ADMIN_COOKIE_SECRET — no Supabase session involved.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';

// ─── Admin handling ────────────────────────────────────────────────────────

async function handleAdmin(req: NextRequest): Promise<NextResponse> {
  // Allow the login page through to avoid redirect loops.
  if (req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    // Misconfigured deployment — block all admin access rather than leaving it open.
    return new NextResponse('Server misconfiguration', { status: 503 });
  }

  const token = req.cookies.get('pack_admin')?.value ?? '';
  const valid = await verifyToken(token, secret);

  if (!valid) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ─── Vendor handling ───────────────────────────────────────────────────────

async function handleVendor(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to login and onboard pages.
  if (
    pathname.startsWith('/vendor/login') ||
    pathname.startsWith('/vendor/onboard')
  ) {
    return NextResponse.next();
  }

  // Build a mutable response so @supabase/ssr can write refreshed tokens back.
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Misconfigured — block rather than leave vendor routes open.
    return new NextResponse('Server misconfiguration', { status: 503 });
  }

  // Middleware variant of the @supabase/ssr cookie adapter:
  //   getAll → reads from the incoming request cookies
  //   setAll → writes refreshed tokens onto both the response cookies AND
  //            the request (so downstream server components see them too)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          req.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the JWT with the Auth server — reliable even if the
  // cookie was tampered with.  We only need session existence here; status
  // (active/suspended) is checked in the /vendor layout via getVendor().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/vendor/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// ─── Dispatcher ────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    return handleAdmin(req);
  }

  if (pathname.startsWith('/vendor')) {
    return handleVendor(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*'],
};
