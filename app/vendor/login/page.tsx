'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { vendorBrowserClient } from '@/lib/supabaseVendorBrowser';

function VendorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only allow same-origin /vendor paths to avoid open-redirect via ?next=.
  const rawNext = searchParams.get('next') ?? '';
  const next =
    rawNext.startsWith('/vendor/') && !rawNext.startsWith('//')
      ? rawNext
      : '/vendor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = vendorBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message ?? 'Invalid email or password');
        return;
      }

      // Session is now stored in cookies by @supabase/ssr.
      // router.refresh() tells Next.js to re-run server components with the
      // new session before navigating to the vendor dashboard.
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cream border border-sand rounded-2xl p-8 space-y-5 shadow-sm"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-espresso mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-sand rounded-lg px-3 py-2 text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-espresso mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-sand rounded-lg px-3 py-2 text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-brick font-medium" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-tangerine text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function VendorLoginPage() {
  return (
    <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-espresso mb-2 text-center">
          Pack Vendors
        </h1>
        <p className="text-center text-sm text-cocoa mb-8">
          Sign in to your vendor portal
        </p>
        <Suspense
          fallback={
            <div className="bg-cream border border-sand rounded-2xl p-8 text-center text-cocoa text-sm">
              Loading…
            </div>
          }
        >
          <VendorLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
