'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// How a vendor actually gets in. Mirrors the real M39 flow: invite-only →
// onboarding link → set up storefront + service area → publish first deal.
// Kept honest about it being invite-based (admin issues the invite).

const STEPS = [
  {
    n: '01',
    title: 'Request an invite',
    body:
      "Tell us about your business. Pack is invite-based for vendors — we'll email you a secure onboarding link to get set up.",
  },
  {
    n: '02',
    title: 'Set up your storefront',
    body:
      'Add your business name, address, logo, and contact details. Your address sets the service area we use for anonymized audience insights.',
  },
  {
    n: '03',
    title: 'Publish your first deal',
    body:
      'Create a credit-gated offer, upload your redemption codes, and it goes live in the in-app marketplace right away.',
  },
  {
    n: '04',
    title: 'Watch it work',
    body:
      'Redemptions and audience insights start flowing into your dashboard. Adjust, add codes, or launch the next offer whenever you like.',
  },
];

export function VendorOnboarding() {
  return (
    <section id="onboarding" className="bg-cream">
      <motion.div
        className="max-w-5xl mx-auto px-6 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerParent}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          variants={fadeUp}
        >
          Onboarding takes an afternoon.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-xl mx-auto mb-12"
          variants={fadeUp}
        >
          No integration, no contract negotiation, no setup fee. From invite to
          your first live deal in four steps.
        </motion.p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUp}>
              <motion.div
                className="font-display text-5xl text-tangerine mb-2"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
              >
                {s.n}
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-cocoa text-sm">{s.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="text-center text-cocoa text-sm mt-12 max-w-2xl mx-auto"
          variants={fadeUp}
        >
          Honest about how it works: dog parents earn Pack credits by walking and
          spend them to claim your deal — those credits go to Pack, not to your
          business. What you get is the visit, the new customer, the exposure to
          an engaged local community, and the audience insight to act on. Pack may
          suspend or remove a vendor or a deal at its discretion.
        </motion.p>
      </motion.div>
    </section>
  );
}
