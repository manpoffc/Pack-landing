'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// Closing CTA. Vendor sign-up is invite-based (admin issues invites in M39),
// so there's no public self-serve form here — the action is a pre-filled
// mailto to start the conversation. A privacy reassurance band sits above it
// because audience data is the part vendors (rightly) ask about first.

const MAILTO =
  'mailto:hello@trypack.app' +
  '?subject=' +
  encodeURIComponent('Pack vendor invite request') +
  '&body=' +
  encodeURIComponent(
    [
      'Business name:',
      'City / neighborhood:',
      'Website (if any):',
      'What you sell:',
      'What you’d like to offer dog parents:',
      '',
      '— Sent from trypack.app/vendors',
    ].join('\n'),
  );

export function VendorApply() {
  return (
    <section id="apply" className="bg-espresso text-parchment">
      <motion.div
        className="max-w-5xl mx-auto px-6 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerParent}
      >
        {/* Privacy reassurance band */}
        <motion.div
          className="bg-parchment/5 border border-parchment/15 rounded-2xl p-6 mb-12 text-center"
          variants={fadeUp}
        >
          <p className="font-display text-lg font-semibold mb-2">
            🔒 Built privacy-first
          </p>
          <p className="text-sm opacity-80 max-w-2xl mx-auto">
            You never see who walks near you or who redeems a deal — only
            aggregate counts. Audience areas with fewer than five dogs are hidden
            entirely, and rare breeds are merged so no household can be singled
            out. Insight, never surveillance.
          </p>
        </motion.div>

        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          variants={fadeUp}
        >
          Become a Pack vendor.
        </motion.h2>
        <motion.p
          className="text-center opacity-80 max-w-xl mx-auto mb-8"
          variants={fadeUp}
        >
          Tell us about your business and we'll send an onboarding link. Free to
          join, live the same day, cancel anytime.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          variants={fadeUp}
        >
          <a
            href={MAILTO}
            className="bg-tangerine text-white font-semibold rounded-full px-7 py-3.5 hover:opacity-90 transition-opacity text-center"
          >
            Request a vendor invite
          </a>
          <a
            href="https://trypack.app/vendor/login"
            className="border border-parchment/30 text-parchment font-semibold rounded-full px-7 py-3.5 hover:border-parchment transition-colors text-center"
          >
            Already a vendor? Log in
          </a>
        </motion.div>

        <motion.p className="text-center text-sm opacity-60 mt-6" variants={fadeUp}>
          Or email us directly at{' '}
          <a href="mailto:hello@trypack.app" className="underline">
            hello@trypack.app
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}
