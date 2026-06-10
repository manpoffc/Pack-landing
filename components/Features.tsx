'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Live map of nearby walkers',
    body:
      'See who else is out with their dog right now. Ghost mode and hide-near-home keep you in control of when you appear.',
  },
  {
    icon: '🥇',
    title: 'Credits for every real walk',
    body:
      'GPS-verified walks earn credits. Pace cap, integrity checks, and a 30-second minimum keep the economy honest.',
  },
  {
    icon: '🐕',
    title: 'Buddy invites + co-walks',
    body:
      'Invite a buddy. If your GPS tracks line up, both of you earn a co-walk bonus.',
  },
  {
    icon: '🔥',
    title: 'Streaks with a 2× multiplier',
    body:
      'Walk seven days in a row and every reward doubles. Day-of reminders keep you from breaking the chain.',
  },
  {
    icon: '🌳',
    title: 'Auto check-in at dog parks',
    body:
      'We detect when you arrive at a dog park and award park-time credits scaled to your dog\'s activity level.',
  },
  {
    icon: '🛍️',
    title: 'Real marketplace, no points soup',
    body:
      'Redeem credits for real merchant vouchers and merch. 100 credits = $1 of value. No mystery rewards.',
  },
];

export function Features() {
  return (
    <section className="bg-cream">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerParent}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-12"
          variants={fadeUp}
        >
          Built for dog parents who actually walk.
        </motion.h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              className="bg-parchment rounded-2xl p-6 border border-sand"
              variants={fadeUp}
              whileHover={{
                y: -4,
                boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
              }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-cocoa">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
