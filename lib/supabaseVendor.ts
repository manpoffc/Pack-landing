/**
 * Server-side Supabase client for vendor auth.
 *
 * Uses the anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY), which is safe to ship to
 * the browser. Authenticates as the signed-in vendor via Supabase Auth JWTs
 * stored in cookies — NOT the service-role key.
 *
 * SERVER ONLY — this file imports `next/headers`. Do NOT import it from
 * 'use client' components. Use lib/supabaseVendorBrowser.ts for browser code.
 *
 * API shape (@supabase/ssr 0.12):
 *   createServerClient with { cookies: { getAll, setAll } }
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Server-side Supabase client for vendor auth.
 *
 * Use in:
 *  - Server components
 *  - Route handlers (app/api/…/route.ts)
 *  - Server actions ('use server')
 *
 * Reads and writes auth cookies via the Next 14 `next/headers` cookies() store.
 * Must NOT be called from 'use client' components.
 */
export function vendorServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called by the Supabase client after a token refresh.
            // If this runs inside a Server Component (where cookies are
            // read-only), the set() will throw.  That's expected — the
            // middleware will handle the refresh on the next request.
          }
        },
      },
    },
  );
}

// For browser usage, import vendorBrowserClient from lib/supabaseVendorBrowser.ts
