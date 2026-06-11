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

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Browser-side Supabase client for vendor auth.
 * Use in 'use client' components only (e.g. the vendor login form).
 */
export function vendorBrowserClient() {
  return createBrowserClient(
    requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}
