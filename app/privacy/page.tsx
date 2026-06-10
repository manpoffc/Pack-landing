{/* DRAFT — review before launch */}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pack',
  description:
    'Learn how Pack collects, uses, and protects your personal data, including your profile, dog information, GPS walk data, and photos.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-prose mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-bold text-espresso mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-cocoa mb-12">Last updated: June 10, 2026</p>

        <div className="prose prose-stone max-w-none text-espresso space-y-8">

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">1. Who We Are</h2>
            <p>
              Pack ("Pack", "we", "us", or "our") operates the trypack.app website and the Pack
              mobile application. If you have questions about this policy, contact us at{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">2. Data We Collect</h2>
            <h3 className="font-semibold text-lg mb-2">On the waitlist</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (required to join)</li>
              <li>Name (optional)</li>
              <li>Referral code, if you arrived via a friend's invite link</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4 mb-2">In the app</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Profile data:</strong> display name, profile photo, optional bio
              </li>
              <li>
                <strong>Dog information:</strong> name, breed, weight range, and photos you upload
              </li>
              <li>
                <strong>GPS walk data:</strong> route coordinates, start/end timestamps, and distance,
                collected only while you have the app open during a walk session
              </li>
              <li>
                <strong>Walk verification photos:</strong> photos you submit at the end of a walk to
                verify it with your dog
              </li>
              <li>
                <strong>Credit and transaction history:</strong> credits earned, redeemed, and the
                reasons (walk verification, referral bonus, etc.)
              </li>
              <li>
                <strong>Push notification token:</strong> so we can send you walk reminders and
                community alerts (you can opt out in your device settings)
              </li>
              <li>
                <strong>Device and usage data:</strong> app version, platform (iOS/Android), and
                crash reports collected via Expo/Sentry
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To operate the waitlist and notify you when your spot is ready</li>
              <li>
                To power the credit economy: awarding credits for GPS-verified walks and referrals,
                detecting fraudulent walk submissions
              </li>
              <li>To send transactional emails (waitlist confirmation, tote shipping updates) via Resend</li>
              <li>To send push notifications via Expo's notification service</li>
              <li>To display your public profile and dog information to nearby Pack members</li>
              <li>To improve the app through anonymised usage analytics</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> use your data for automated advertising profiling or sell it to
              third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">4. Service Providers We Share Data With</h2>
            <p>
              We share your data only with the following processors, under data processing agreements,
              strictly to operate the service:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Supabase</strong> — database and authentication infrastructure (servers in the
                United States)
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery
              </li>
              <li>
                <strong>Expo / EAS</strong> — push notifications and app distribution
              </li>
              <li>
                <strong>Vercel</strong> — website hosting and cookieless, aggregated analytics
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to any third party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">5. Data Retention &amp; Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You can delete your Pack
              account at any time from within the app (Settings → Delete Account). Deletion permanently
              removes your profile, dog data, GPS walk history, and photos. Aggregated, anonymised
              analytics are not deleted. Waitlist records are deleted 90 days after you convert to a
              full account or, if you never convert, 12 months after sign-up.
            </p>
            <p className="mt-3">
              To request early deletion of waitlist data, email{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>{' '}
              with subject line "Data Deletion Request".
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">6. Cookies &amp; Tracking</h2>
            <p>
              trypack.app does not use advertising cookies or cross-site trackers. We may set a minimal
              session cookie if you sign in. Analytics, if any, use anonymised, aggregated data only.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">7. Children's Privacy</h2>
            <p>
              Pack is not directed at children under 13. We do not knowingly collect personal data from
              anyone under 13. If you believe a child has submitted data to us, contact us and we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated via
              in-app notification or email at least 14 days in advance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">9. Contact</h2>
            <p>
              Questions or requests:{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
