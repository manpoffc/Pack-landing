'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

type Stage = 'form' | 'success' | 'error';

type JoinResponse = {
  id: string;
  referral_code: string;
  referral_count: number;
  rank: number;
  total: number;
  already_signed_up: boolean;
};

export function WaitlistForm({ referredByCode }: { referredByCode?: string }) {
  const [stage, setStage] = useState<Stage>('form');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<JoinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    let joined: JoinResponse | null = null;
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          referred_by_code: referredByCode,
        }),
      });
      const body = (await res.json()) as JoinResponse | { error: string };
      if (!res.ok || 'error' in body) {
        throw new Error('error' in body ? body.error : 'signup failed');
      }
      setResult(body);
      setStage('success');
      joined = body;
    } catch (err) {
      setError((err as Error).message);
      setStage('error');
      return;
    } finally {
      setSubmitting(false);
    }
    // Outside the try: a (hypothetical) analytics throw must not flip a
    // successful signup into the error state. Re-registrations are tagged so
    // conversion numbers only count first-time joins.
    track('waitlist_signup', {
      referred: Boolean(referredByCode),
      already: joined?.already_signed_up ?? false,
    });
  }

  async function copyLink() {
    if (!result) return;
    const url = `https://trypack.app/r/${result.referral_code}`;
    await navigator.clipboard.writeText(url);
    track('referral_link_copied');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (stage === 'success' && result) {
    const url = `https://trypack.app/r/${result.referral_code}`;
    const shareMessage = `Join me on Pack — we both earn credits when you sign up. ${url}`;
    return (
      <div className="max-w-xl mx-auto bg-parchment border border-sand rounded-2xl p-8 text-left">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎁</div>
          <h3 className="font-display text-2xl font-bold">
            {result.already_signed_up ? "You're already on the waitlist." : "You're on the waitlist."}
          </h3>
          {/* Deliberately no rank/total numbers — scarcity without exposing scale. */}
          <p className="text-cocoa mt-2">
            The first <b>200 walkers</b> get the free custom tote — and the order shifts
            every day. Every friend who joins with your link moves you up
            (and bumps someone else down).
          </p>
        </div>
        <p className="text-sm text-cocoa mb-2">Your invite link:</p>
        <div className="flex gap-2 items-center bg-cream rounded-lg px-3 py-2 border border-sand">
          <code className="flex-1 font-mono text-sm truncate">{url}</code>
          <button
            onClick={copyLink}
            className="bg-tangerine text-white text-sm font-medium px-3 py-1 rounded-md hover:opacity-90"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {result.referral_count > 0 ? (
          <p className="text-sm text-cocoa mt-4">
            {result.referral_count} friend{result.referral_count === 1 ? ' has' : 's have'} joined with your code.
          </p>
        ) : null}
        <p className="text-sm text-cocoa mt-4 mb-2">Share your link:</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('referral_share', { channel: 'whatsapp' })}
            className="bg-tangerine text-white text-sm font-medium px-3 py-1 rounded-md hover:opacity-90"
          >
            WhatsApp
          </a>
          <a
            href={`sms:?&body=${encodeURIComponent(shareMessage)}`}
            onClick={() => track('referral_share', { channel: 'sms' })}
            className="bg-tangerine text-white text-sm font-medium px-3 py-1 rounded-md hover:opacity-90"
          >
            Messages
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white border border-sand rounded-xl px-4 py-3 text-base focus:outline-none focus:border-tangerine"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-tangerine text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
        >
          {submitting ? 'Joining…' : 'Join waitlist'}
        </button>
      </div>
      {referredByCode ? (
        <p className="text-xs text-cocoa mt-3 text-center">
          Referral code <span className="font-mono">{referredByCode}</span> applied — your friend climbs the list when you join.
        </p>
      ) : (
        <p className="text-xs text-cocoa mt-3 text-center">
          We'll only email you with Pack updates.
        </p>
      )}
      {error ? <p className="text-brick text-sm mt-3 text-center">{error}</p> : null}
    </form>
  );
}
