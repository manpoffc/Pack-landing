'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';
import { VendorRequestForm } from './VendorRequestForm';

// Closing CTA. Vendor sign-up is invite-based (admin issues invites in M39),
// so this captures the request via a form that emails the team + records it;
// an admin then issues the real invite from /admin/vendors. A privacy
// reassurance band sits above because audience data is the part vendors
// (rightly) ask about first.

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

        <motion.div variants={fadeUp}>
          <VendorRequestForm />
        </motion.div>

        <motion.p className="text-center text-sm opacity-60 mt-8" variants={fadeUp}>
          Already a vendor?{' '}
          <a href="https://trypack.app/vendor/login" className="underline">
            Log in
          </a>
          {'  ·  '}
          Prefer email?{' '}
          <a href="mailto:hello@trypack.app" className="underline">
            hello@trypack.app
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}
