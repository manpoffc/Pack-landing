'use client';

import { motion } from 'framer-motion';
import { fadeUp, heroUp, staggerParent } from '@/lib/motion';

// Hero for the vendor marketing page. Leads with the audience promise —
// engaged local dog parents walking past the door — and pushes to #apply.
// No phone mockup here; the proof is in the Offer + Insights sections below.

export function VendorHero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center"
        initial="hidden"
        animate="visible"
        variants={staggerParent}
      >
        <motion.p
          className="text-sm uppercase tracking-widest text-cocoa mb-4"
          variants={fadeUp}
        >
          Pack for local businesses
        </motion.p>

        <motion.h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight"
          variants={heroUp}
        >
          Reach the dog parents
          <br className="hidden sm:block" /> walking past your door.
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-cocoa max-w-2xl mx-auto"
          variants={fadeUp}
        >
          Pack is the social walking app for dog parents — a loyal, local,
          high-intent audience out in your neighborhood every single day. Post a
          deal, fill your store with new faces, and see exactly who you're
          reaching. No ad spend, no agency, no guesswork.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          variants={fadeUp}
        >
          <a
            href="#apply"
            className="bg-tangerine text-white font-semibold rounded-full px-7 py-3.5 hover:opacity-90 transition-opacity"
          >
            Request a vendor invite
          </a>
          <a
            href="#offer"
            className="border border-sand bg-parchment text-espresso font-semibold rounded-full px-7 py-3.5 hover:border-cocoa transition-colors"
          >
            See what you get
          </a>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto"
          variants={fadeUp}
        >
          {[
            ['Local', 'Reach walkers in your service area'],
            ['Measurable', 'Every redemption tracked, daily'],
            ['Private', 'Audience insights, never personal data'],
          ].map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="font-display text-lg font-semibold text-espresso">{k}</p>
              <p className="text-xs text-cocoa mt-1">{v}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
