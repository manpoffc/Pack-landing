'use client';

import { motion } from 'framer-motion';
import { PhoneFrame } from './PhoneFrame';
import { fadeUp, staggerParent, tileHover } from '@/lib/motion';

// Four-step visual walk-through of the app. Inner UIs are CSS/SVG
// illustrations that match the actual app design but aren't recordings.

export function AppPreview() {
  return (
    <section className="bg-cream">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerParent}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          variants={fadeUp}
        >
          What it actually looks like.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-xl mx-auto mb-14"
          variants={fadeUp}
        >
          Four moments from a Pack walk — start, track, redeem, share.
        </motion.p>

        <motion.div
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center"
          variants={staggerParent}
        >
          <motion.div variants={fadeUp} whileHover={tileHover}>
            <PhoneFrame step="01 · Map" caption="See nearby walkers and dog parks. Tap any pin for context.">
              <MockMap />
            </PhoneFrame>
          </motion.div>
          <motion.div variants={fadeUp} whileHover={tileHover}>
            <PhoneFrame step="02 · Walk" caption="Tap once. GPS tracks the walk, credits land when you finish.">
              <MockWalk />
            </PhoneFrame>
          </motion.div>
          <motion.div variants={fadeUp} whileHover={tileHover}>
            <PhoneFrame step="03 · Redeem" caption="Spend credits on vouchers, merch, and charity pledges.">
              <MockMarketplace />
            </PhoneFrame>
          </motion.div>
          <motion.div variants={fadeUp} whileHover={tileHover}>
            <PhoneFrame step="04 · Refer" caption="Share your code. Each friend who joins climbs you up the tote list.">
              <MockReferral />
            </PhoneFrame>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function MockMap() {
  return (
    <div className="w-full h-full bg-[#f0e8d8] relative">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 480">
        <g stroke="#d8c6a8" strokeWidth="2" fill="none">
          <line x1="0" y1="80" x2="240" y2="80" />
          <line x1="0" y1="200" x2="240" y2="200" />
          <line x1="0" y1="320" x2="240" y2="320" />
          <line x1="60" y1="0" x2="60" y2="480" />
          <line x1="160" y1="0" x2="160" y2="480" />
        </g>
        <rect x="80" y="120" width="80" height="100" rx="8" fill="#cce0b8" />
        <text x="120" y="175" fontSize="22" textAnchor="middle">🐾</text>

        {/* Walkers with a gentle radar pulse */}
        <PulseCircle cx={50} cy={240} color="#E25822" />
        <PulseCircle cx={180} cy={380} color="#E25822" />
        <circle cx="110" cy="350" r="10" fill="#2A9D8F" />
      </svg>
      <div className="absolute top-12 left-3 right-3 bg-white rounded-xl px-3 py-2 shadow-md text-xs font-semibold text-espresso">
        🐾 3 walkers nearby
      </div>
      <div className="absolute bottom-4 left-3 right-3 bg-tangerine text-white text-center py-3 rounded-xl text-sm font-semibold shadow-lg">
        Start a walk
      </div>
    </div>
  );
}

function PulseCircle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <>
      <motion.circle
        cx={cx}
        cy={cy}
        fill={color}
        opacity={0.25}
        initial={{ r: 10 }}
        animate={{ r: [10, 24, 10], opacity: [0.35, 0, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <circle cx={cx} cy={cy} r={10} fill={color} />
    </>
  );
}

function MockWalk() {
  return (
    <div className="w-full h-full bg-parchment relative">
      <div className="absolute top-12 left-0 right-0 h-32 bg-[#f0e8d8]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 128">
          <motion.path
            d="M 30 100 Q 80 50 120 70 T 200 30"
            stroke="#E25822"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="200"
            cy="30"
            r="6"
            fill="#E25822"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.6 }}
          />
        </svg>
      </div>
      <div className="absolute top-44 left-0 right-0 px-5 text-center">
        <div className="text-xs uppercase tracking-widest text-cocoa">Elapsed</div>
        <div className="font-display text-4xl text-espresso mt-1">12:34</div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Stat label="Distance" value="0.9 mi" />
          <Stat label="Pace" value="13'15&quot;" />
          <Stat label="Credits" value="9" />
        </div>
        <motion.div
          className="bg-cream rounded-xl px-3 py-2 mt-6 text-xs text-cocoa"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐾 Buddy spotted nearby
        </motion.div>
      </div>
      <div className="absolute bottom-4 left-3 right-3 bg-espresso text-parchment text-center py-3 rounded-xl text-sm font-semibold">
        End walk
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-lg py-2">
      <div className="text-[10px] uppercase text-cocoa">{label}</div>
      <div className="font-semibold text-sm text-espresso mt-1">{value}</div>
    </div>
  );
}

function MockMarketplace() {
  return (
    <div className="w-full h-full bg-parchment relative">
      <div className="absolute top-12 left-3 right-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-espresso">◇ 240 credits</span>
        <span className="text-cocoa">History</span>
      </div>
      <div className="absolute top-24 left-3 right-3 space-y-3">
        <motion.div
          className="bg-parchment border border-sand rounded-xl overflow-hidden"
          whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-cream h-20 flex items-center justify-center text-3xl">🛍️</div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-sm text-espresso">Pack Custom Tote</div>
              <motion.span
                className="bg-sage text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                FREE
              </motion.span>
            </div>
            <div className="text-[10px] text-cocoa mt-1">Top 200 walkers · ships in ~4 weeks</div>
          </div>
        </motion.div>
        <div className="bg-parchment border border-sand rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-xs text-espresso">$10 Bark Box voucher</div>
            <span className="bg-tangerine text-white text-[10px] font-bold px-2 py-0.5 rounded-full">100</span>
          </div>
        </div>
        <div className="bg-parchment border border-sand rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-xs text-espresso">Pack Donates pledge</div>
            <span className="bg-tangerine text-white text-[10px] font-bold px-2 py-0.5 rounded-full">50</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockReferral() {
  return (
    <div className="w-full h-full bg-parchment relative">
      <div className="absolute top-14 left-3 right-3">
        <motion.div
          className="bg-parchment border border-sand rounded-2xl p-4"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="text-tangerine text-lg">🎁</div>
            <div>
              <div className="font-semibold text-sm text-espresso">Refer a friend</div>
              {/* Bonus amounts mirror src/features/credits/creditEconomy.ts
                  (source of truth: scripts/m26b-referrals.sql) — keep in sync. */}
              <div className="text-[10px] text-cocoa">They get 100 cr. You get 500.</div>
            </div>
          </div>
          <div className="bg-cream rounded-lg py-3 text-center font-mono font-bold text-espresso tracking-widest">
            PCK-XK7P9A
          </div>
          <div className="text-[10px] text-cocoa text-center mt-3">3 friends joined</div>
          <div className="bg-tangerine text-white text-center text-xs font-semibold py-2 rounded-lg mt-3">
            ⤴ Share invite
          </div>
        </motion.div>
        <div className="mt-4 px-3 text-center text-[11px] text-cocoa leading-relaxed">
          Climb the waitlist by inviting friends.
          <br />Top 200 get a free custom tote.
        </div>
      </div>
    </div>
  );
}
