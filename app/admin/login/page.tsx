'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only allow same-origin admin paths — never an absolute or protocol-relative
  // URL — so ?next= can't be used as a post-login open redirect to a phishing
  // site. `//evil.com` and `https://evil.com` both fall back to the dashboard.
  const rawNext = searchParams.get('next') ?? '';
  const next =
    rawNext.startsWith('/admin/') && !rawNext.startsWith('//')
      ? rawNext
      : '/admin/events';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? 'Invalid password');
      }
    } catch {
      setError('Network error — please try again');
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
        <p className="text-sm text-brick font-medium">{error}</p>
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

export default function AdminLoginPage() {
  return (
    <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-espresso mb-8 text-center">
          Pack Admin
        </h1>
        <Suspense
          fallback={
            <div className="bg-cream border border-sand rounded-2xl p-8 text-center text-cocoa text-sm">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
