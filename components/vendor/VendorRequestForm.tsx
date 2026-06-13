'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

// Public "Request a vendor invite" form. Posts to /api/vendor/request, which
// saves the request and emails the team. Lives in the dark espresso #apply
// section, so inputs are light-on-dark for legibility. Mirrors WaitlistForm's
// form/success/error stages.

type Stage = 'form' | 'success' | 'error';

const inputCls =
  'w-full bg-parchment text-espresso border border-sand rounded-xl px-4 py-3 text-base placeholder:text-cocoa/60 focus:outline-none focus:border-tangerine';

export function VendorRequestForm() {
  const [stage, setStage] = useState<Stage>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    email: '',
    city: '',
    website_url: '',
    what_they_sell: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/vendor/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'request failed');
      setStage('success');
    } catch (err) {
      setError((err as Error).message);
      setStage('error');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    try {
      track('vendor_request_submitted');
    } catch {
      /* analytics must never break a successful submit */
    }
  }

  if (stage === 'success') {
    return (
      <div className="max-w-xl mx-auto bg-parchment/5 border border-parchment/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="font-display text-2xl font-bold">Request received.</h3>
        <p className="opacity-80 mt-2">
          Thanks — we'll review your business and email{' '}
          <span className="font-semibold">{form.email}</span> with an onboarding
          link. Most invites go out within a couple of business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-1">Business name *</label>
          <input
            className={inputCls}
            required
            placeholder="Bark Avenue Grooming"
            value={form.business_name}
            onChange={set('business_name')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email *</label>
          <input
            className={inputCls}
            type="email"
            required
            placeholder="you@business.com"
            value={form.email}
            onChange={set('email')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">City / neighborhood</label>
          <input
            className={inputCls}
            placeholder="Brooklyn, NY"
            value={form.city}
            onChange={set('city')}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-1">Website (optional)</label>
          <input
            className={inputCls}
            placeholder="https://"
            value={form.website_url}
            onChange={set('website_url')}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-1">What you'd offer dog parents</label>
          <textarea
            className={`${inputCls} min-h-[84px] resize-y`}
            placeholder="e.g. 20% off a first grooming, a free treat bag, $5 off any leash…"
            value={form.what_they_sell}
            onChange={set('what_they_sell')}
          />
        </div>
      </div>

      {error ? <p className="text-tangerine text-sm mt-3">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full bg-tangerine text-white font-semibold rounded-full px-7 py-3.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? 'Sending…' : 'Request a vendor invite'}
      </button>
      <p className="text-xs opacity-60 mt-3 text-center">
        Free to join · we'll only email you about your vendor request.
      </p>
    </form>
  );
}
