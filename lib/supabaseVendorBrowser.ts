/**
 * Browser-side Supabase client for vendor auth.
 *
 * This file is safe to import from 'use client' components — it does NOT
 * import `next/headers` or any other server-only module.
 *
 * Uses the anon/publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY), which is
 * intentionally exposed to the browser.  Authentication is handled via
 * Supabase Auth JWTs stored in cookies by @supabase/ssr's createBrowserClient.
 *
 * No `cookies` option is needed — createBrowserClient falls back to
 * document.cookie automatically in browser runtimes.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client for vendor auth.
 * Use in 'use client' components only (e.g. the vendor login form).
 *
 * IMPORTANT: read the env vars by their LITERAL names. Next.js only inlines
 * NEXT_PUBLIC_* into the browser bundle for static `process.env.NEXT_PUBLIC_FOO`
 * references — a dynamic `process.env[name]` is NOT replaced and reads as
 * undefined in the browser (which surfaced as a "Network error" on login).
 */
export function vendorBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser env missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)',
    );
  }
  return createBrowserClient(url, anonKey);
}
