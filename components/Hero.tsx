'use client';

import { motion } from 'framer-motion';
import { PawTrail } from './PawTrail';
import { StoreBadges } from './StoreBadges';
import { WaitlistForm } from './WaitlistForm';
import { fadeUp, heroUp, staggerParent } from '@/lib/motion';

export function Hero({
  referredByCode,
  referrerName,
}: {
  referredByCode?: string;
  referrerName?: string | null;
}) {
  return (
    <section className="relative overflow-hidden">
      <PawTrail />
      <motion.div
        className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center"
        style={{ zIndex: 1 }}
        initial="hidden"
        animate="visible"
        variants={staggerParent}
      >
        <motion.p
          className="text-sm uppercase tracking-widest text-cocoa mb-4"
          variants={fadeUp}
        >
          {referredByCode
            ? `Invited${referrerName ? ` by ${referrerName}` : ''}`
            : 'Now in private beta'}
        </motion.p>

        <motion.h1
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight"
          variants={heroUp}
        >
          Walks worth showing up for.
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-cocoa max-w-2xl mx-auto"
          variants={fadeUp}
        >
          Pack is the social walking app for dog parents. Meet nearby walkers,
          build a streak, earn credits for every walk, and redeem real perks.
        </motion.p>

        <motion.div className="mt-10" id="waitlist" variants={fadeUp}>
          <WaitlistForm referredByCode={referredByCode} />
        </motion.div>

        <motion.div className="mt-12" variants={fadeUp}>
          <StoreBadges />
        </motion.div>

        <motion.div
          className="mt-14 inline-block bg-sage text-parchment px-5 py-3 rounded-full text-sm font-medium"
          variants={fadeUp}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.2 }}
        >
          🎁 First 200 walkers get a free custom Pack tote — printed with your
          dog's name.
        </motion.div>
      </motion.div>
    </section>
  );
}
