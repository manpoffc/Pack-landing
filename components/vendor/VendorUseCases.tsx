'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// Ties the tools to outcomes — the "what can I actually do with this" section.
// Each card pairs an insight (Nearby Dogs) with an action (Deals) and a way to
// measure it (Analytics), so the three pillars read as one workflow.

const CASES = [
  {
    icon: '🚀',
    title: 'Launch a new product',
    body:
      'Check the breed and size mix near you before you stock it, then float a limited-inventory intro deal to put it in real hands fast. Watch first-week redemptions to gauge demand before you scale.',
  },
  {
    icon: '📣',
    title: 'Run a local campaign',
    body:
      'Spin up a seasonal or grand-opening offer that publishes instantly to the marketplace. Track daily claims, top up codes when they run low, and pause it the moment your goal is hit.',
  },
  {
    icon: '🧪',
    title: 'Test, then double down',
    body:
      'Run two deals side by side and let the redemption numbers pick the winner. No surveys, no guesswork — just which offer your neighbors actually claimed.',
  },
  {
    icon: '🎯',
    title: 'Right-size your inventory',
    body:
      "Mostly small dogs within five miles? Lots of seniors? Let the anonymized audience read shape what you carry, how you price it, and who you speak to.",
  },
  {
    icon: '🔁',
    title: 'Bring customers back',
    body:
      'Reward repeat visits with a fresh deal whenever you want one live. Being a recurring perk in the app keeps your name in the walk, week after week.',
  },
  {
    icon: '📊',
    title: 'Prove the channel works',
    body:
      'Every redemption is a measurable, attributable visit. Show stakeholders exactly what Pack drove — in claims and in the credits customers spent with you.',
  },
];

export function VendorUseCases() {
  return (
    <section>
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
          Insight in, action out.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-2xl mx-auto mb-12"
          variants={fadeUp}
        >
          Read your audience, launch the right offer, measure the result —
          then do it again, smarter.
        </motion.p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <motion.div
              key={c.title}
              className="bg-parchment rounded-2xl p-6 border border-sand"
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-4xl mb-3">{c.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-cocoa">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
