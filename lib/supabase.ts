import { createClient } from '@supabase/supabase-js';

// Server-only client — uses the service role key. Never import this from a
// component that runs in the browser (the type system + linter won't catch
// that — you have to check).
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('missing supabase env');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
