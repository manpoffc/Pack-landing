'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// The core "how you earn" story, told visually. A single discount does two
// jobs at once — brings paying customers AND reveals a target audience — and
// the two compound into more sales. Minimal words, big icons, clear flow.
// Honest framing kept: "earn" = real customers spending in your store (the
// Pack credits they spend go to Pack, noted in the footnote).

const OUTCOMES = [
  {
    accent: 'border-sage',
    chipBg: 'bg-sage/15 text-sage',
    icon: '🚶',
    kicker: 'Return #1',
    title: 'It brings you customers',
    body: 'Motivated dog parents redeem your code and walk through your door. Real visits, real sales — no ad spend.',
    chips: ['Foot traffic', 'New faces', 'Repeat visits'],
  },
  {
    accent: 'border-tangerine',
    chipBg: 'bg-tangerine/15 text-tangerine',
    icon: '🎯',
    kicker: 'Return #2',
    title: 'It reveals your target audience',
    body: 'Every claim — plus the anonymized dogs active nearby — shows who your customers really are. Plan your next move with it.',
    chips: ['How many nearby', 'Size · breed · age', 'What sells'],
  },
];

const FLYWHEEL = [
  { icon: '🎟️', title: 'Offer a deal', body: 'Post a discount in minutes.' },
  { icon: '🚶', title: 'Customers visit', body: 'They redeem and walk in.' },
  { icon: '🎯', title: 'Learn your audience', body: 'See who they are.' },
  { icon: '🚀', title: 'Offer something sharper', body: 'Target it — and earn more.' },
];

// Arrow that points down on mobile (stacked) and right on desktop (in a row).
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-2xl text-tangerine/70 shrink-0">
      <span className="md:hidden">↓</span>
      <span className="hidden md:inline">→</span>
    </div>
  );
}

export function VendorValueLoop() {
  return (
    <section className="border-t border-sand/60">
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
          One discount. Two ways to win.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-2xl mx-auto mb-14"
          variants={fadeUp}
        >
          Sign up, post a single offer, and it goes to work twice over — filling
          your store today and telling you exactly who to sell to next.
        </motion.p>

        {/* Step 1 — the action */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="bg-parchment border-2 border-tangerine rounded-2xl px-8 py-5 text-center max-w-sm w-full">
            <div className="text-4xl mb-1">🎟️</div>
            <p className="font-display text-xl font-bold text-espresso">
              You post a discount
            </p>
            <p className="text-sm text-cocoa mt-1">
              Takes 2 minutes · free to publish · live the same day
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col items-center my-2">
          <span className="text-2xl text-tangerine/70">↓</span>
          <span className="text-xs uppercase tracking-widest text-cocoa">
            every redemption does two jobs
          </span>
        </motion.div>

        {/* Step 2 — the two returns, side by side */}
        <motion.div
          className="grid gap-5 md:grid-cols-2 mb-2"
          variants={fadeUp}
        >
          {OUTCOMES.map((o) => (
            <div
              key={o.title}
              className={`bg-parchment border-l-4 ${o.accent} border border-sand rounded-2xl p-6`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{o.icon}</span>
                <span className="text-xs uppercase tracking-widest text-cocoa font-semibold">
                  {o.kicker}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{o.title}</h3>
              <p className="text-cocoa text-sm mb-4">{o.body}</p>
              <div className="flex flex-wrap gap-2">
                {o.chips.map((c) => (
                  <span
                    key={c}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${o.chipBg}`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center my-2">
          <span className="text-2xl text-tangerine/70">↓</span>
        </motion.div>

        {/* Step 3 — the payoff */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="bg-espresso text-parchment rounded-2xl px-8 py-6 text-center max-w-2xl w-full">
            <div className="text-4xl mb-1">📈</div>
            <p className="font-display text-xl sm:text-2xl font-bold">
              So you earn more — on purpose
            </p>
            <p className="text-sm opacity-80 mt-2 max-w-xl mx-auto">
              Use what you learned to launch a sharper offer, stock the right
              products, and bring customers back. Better targeting → better
              offers → more sales.
            </p>
          </div>
        </motion.div>

        {/* The flywheel — it compounds */}
        <motion.p
          className="text-center font-display text-2xl font-bold mt-20 mb-3"
          variants={fadeUp}
        >
          And it compounds.
        </motion.p>
        <motion.p
          className="text-cocoa text-center max-w-xl mx-auto mb-10"
          variants={fadeUp}
        >
          Each trip around the loop brings more customers and sharper targeting —
          that's the Pack vendor flywheel.
        </motion.p>

        <motion.div
          className="flex flex-col md:flex-row md:items-stretch gap-3"
          variants={fadeUp}
        >
          {FLYWHEEL.map((s, i) => (
            <div key={s.title} className="contents">
              <div className="flex-1 bg-cream rounded-2xl p-5 text-center border border-sand">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-display font-semibold text-espresso mb-1">
                  {s.title}
                </p>
                <p className="text-xs text-cocoa">{s.body}</p>
              </div>
              {i < FLYWHEEL.length - 1 && <FlowArrow />}
            </div>
          ))}
        </motion.div>
        <motion.p
          className="text-center text-sm text-tangerine font-semibold mt-4"
          variants={fadeUp}
        >
          ↻ then around again — bigger each time
        </motion.p>

        <motion.p
          className="text-center text-xs text-cocoa mt-10 max-w-2xl mx-auto"
          variants={fadeUp}
        >
          You earn from customers spending in your store. Dog parents pay with
          Pack credits they earned by walking; those credits go to Pack, not your
          business — your return is the visit, the sale, and the audience insight.
        </motion.p>
      </motion.div>
    </section>
  );
}
