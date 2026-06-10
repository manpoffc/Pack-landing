'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

const STEPS = [
  {
    n: '01',
    title: 'Join the waitlist',
    body:
      "Drop your email. You get a personal invite code that you can share with other dog parents.",
  },
  {
    n: '02',
    title: 'Climb by inviting friends',
    body:
      'Each friend who joins with your code moves you up the ranking. Top 200 at the moment of their first walk get a free custom tote.',
  },
  {
    n: '03',
    title: 'Get in, take a walk',
    body:
      'When we let you in, your first GPS-tracked walk freezes your rank. We send you a notification + email if you made the top 200 — claim your tote inside the app.',
  },
];

export function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerParent}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          variants={fadeUp}
        >
          How the waitlist works.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-xl mx-auto mb-12"
          variants={fadeUp}
        >
          We're letting people in gradually. Sharing your code moves you up — being early on the list
          and bringing friends is how you win the tote.
        </motion.p>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
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
              <p className="text-cocoa">{s.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="text-center text-cocoa text-sm mt-12 max-w-xl mx-auto"
          variants={fadeUp}
        >
          Honest rules: ranking is (referral count, then signup time). Top 200 is frozen at the
          moment of each user's first walk — so jumping ahead before someone walks still gets you the
          tote. We ship within ~4 weeks of you confirming your address.
        </motion.p>
      </motion.div>
    </section>
  );
}
