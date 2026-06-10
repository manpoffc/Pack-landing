import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AppPreview } from '@/components/AppPreview';
import { Features } from '@/components/Features';
import { ToteShowcase } from '@/components/ToteShowcase';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase';

// Referral landing page. The /r/[code] form pre-fills the referral code in
// the waitlist form. Server-side, we look up the referrer's first name so
// the headline reads "Invited by Alex" — small touch, big trust boost.
//
// Invalid codes return 404 so we don't reward attackers for guessing.
//
// Note: generateMetadata and the page component each call supabase independently.
// supabase-js does not deduplicate requests the way Next's fetch() cache does,
// so two DB round-trips occur per request. Given the lightweight query this is
// acceptable; a shared helper would require a module-level cache that's harder
// to reason about in a serverless context.

export const dynamic = 'force-dynamic';

type WaitlistRow = { name: string | null };

// Distinguishes "code doesn't exist" (404) from "referrer never gave a name"
// (valid link, generic headline) — names are optional at signup.
async function lookupReferrer(
  code: string,
): Promise<{ found: boolean; firstName: string | null }> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('waitlist')
    .select('name')
    .eq('referral_code', code)
    .maybeSingle();
  if (!data) return { found: false, firstName: null };
  return { found: true, firstName: (data as WaitlistRow).name?.split(' ')[0] ?? null };
}

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const code = params.code.toUpperCase();
  const isValid = /^PCK-W-[A-Z0-9]{6}$/.test(code);
  const firstName = isValid ? (await lookupReferrer(code)).firstName : null;

  const title = firstName ? `Join ${firstName} on Pack` : 'Join the Pack waitlist';
  const description =
    "Real dogs, real walks, real credits — meet other dog parents nearby, earn rewards for walking, and turn habit into a community. Join the waitlist.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ReferralPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  if (!/^PCK-W-[A-Z0-9]{6}$/.test(code)) notFound();

  const { found, firstName: referrerName } = await lookupReferrer(code);
  if (!found) notFound();

  return (
    <>
      <Header />
      <main>
        <Hero referredByCode={code} referrerName={referrerName} />
        <AppPreview />
        <Features />
        <ToteShowcase />
        <HowItWorks />
        <Footer />
      </main>
    </>
  );
}
