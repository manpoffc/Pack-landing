'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// The "why bother" section. Honest framing: vendors don't collect the Pack
// credits customers spend (those go to Pack). The vendor's return is foot
// traffic, new local customers, brand exposure to an engaged community, and
// audience intelligence they can't get from a coupon book.

const BENEFITS = [
  {
    icon: '🚶',
    title: 'An audience that shows up — daily',
    body:
      'Dog parents walk every day, rain or shine, and they walk locally. Pack puts your business in front of the people already moving through your neighborhood.',
  },
  {
    icon: '🎟️',
    title: 'Turn a deal into foot traffic',
    body:
      'Publish a credit-gated offer and it lands in the in-app marketplace. Walkers spend the credits they earned to claim your code — a warm, motivated customer walking through your door.',
  },
  {
    icon: '📈',
    title: 'See what actually worked',
    body:
      'Every redemption is tracked. Watch claims roll in day by day, know when a code pool is running low, and compare one offer against another with real numbers.',
  },
  {
    icon: '🐶',
    title: 'Know your block',
    body:
      'An anonymized read on the dogs active around you — how many, what sizes, which breeds, what ages — so you can stock, price, and pitch for the audience you actually have.',
  },
  {
    icon: '💸',
    title: 'No ad budget required',
    body:
      'No CPMs, no agency retainer, no managing a campaign across five dashboards. Set up a deal in minutes and let an engaged community do the discovery.',
  },
  {
    icon: '🤝',
    title: 'Brand love, not banner blindness',
    body:
      'You show up where dog parents are already spending happy, healthy time. Being part of the walk beats being an ad they scroll past.',
  },
];

export function VendorBenefits() {
  return (
    <section className="bg-cream">
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
          Why local businesses join Pack.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-2xl mx-auto mb-12"
          variants={fadeUp}
        >
          You're not buying impressions. You're meeting the dog parents in your
          own neighborhood — and learning who they are as you do.
        </motion.p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              className="bg-parchment rounded-2xl p-6 border border-sand"
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{b.title}</h3>
              <p className="text-cocoa">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
