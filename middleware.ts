import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Allow the login page through without a check to avoid redirect loops.
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
    // Preserve the intended destination so the login page can redirect after auth.
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
