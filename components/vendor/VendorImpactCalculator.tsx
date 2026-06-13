'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';
import { AnimatedNumber } from './AnimatedNumber';

// Interactive impact estimator. Vendors drive it themselves — pick a service
// area, dial in how appealing their offer is and their average ticket, and the
// outputs ease to new values live. Explicitly illustrative: the math is simple
// and shown, so it reads as a planning tool, not a promise.

// Baseline "dogs active near you" per radius — matches the sample audience in
// the live Nearby-Dogs demo so the page tells one consistent story.
const AUDIENCE: Record<number, number> = { 5: 71, 10: 182, 25: 540 };
const RADII = [5, 10, 25] as const;

const usd = (n: number) => '$' + Math.round(n).toLocaleString();

export function VendorImpactCalculator() {
  const [radius, setRadius] = useState<number>(10);
  const [appeal, setAppeal] = useState<number>(8); // % of nearby dogs who claim / month
  const [spend, setSpend] = useState<number>(25); // avg in-store spend per visit ($)

  const audience = AUDIENCE[radius];
  const redemptions = Math.round((audience * appeal) / 100);
  const revenue = redemptions * spend;
  const annual = revenue * 12;

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
          See the impact before you commit.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-2xl mx-auto mb-12"
          variants={fadeUp}
        >
          Drag the dials to your situation. This is an illustrative estimate from
          your own inputs — not a guarantee — but it shows how a single Pack deal
          can pencil out.
        </motion.p>

        <motion.div
          className="grid gap-8 md:grid-cols-2 md:items-stretch"
          variants={fadeUp}
        >
          {/* Controls */}
          <div className="bg-parchment border border-sand rounded-2xl p-6 sm:p-8">
            <div className="mb-7">
              <p className="font-display font-semibold text-espresso mb-3">
                Service area
              </p>
              <div className="flex gap-2">
                {RADII.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                      radius === r
                        ? 'bg-tangerine text-white'
                        : 'bg-cream text-cocoa hover:text-espresso'
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
              <p className="text-xs text-cocoa mt-2">
                <AnimatedNumber value={audience} className="font-semibold text-espresso" />{' '}
                dogs active in this radius (sample data)
              </p>
            </div>

            <div className="mb-7">
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="appeal" className="font-display font-semibold text-espresso">
                  How appealing is your offer?
                </label>
                <span className="text-sm font-semibold text-tangerine">{appeal}%</span>
              </div>
              <input
                id="appeal"
                type="range"
                min={2}
                max={25}
                step={1}
                value={appeal}
                onChange={(e) => setAppeal(Number(e.target.value))}
                className="w-full accent-tangerine"
              />
              <p className="text-xs text-cocoa mt-1">
                Share of nearby dog parents who claim it each month
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="spend" className="font-display font-semibold text-espresso">
                  Average spend per visit
                </label>
                <span className="text-sm font-semibold text-tangerine">{usd(spend)}</span>
              </div>
              <input
                id="spend"
                type="range"
                min={5}
                max={100}
                step={5}
                value={spend}
                onChange={(e) => setSpend(Number(e.target.value))}
                className="w-full accent-tangerine"
              />
              <p className="text-xs text-cocoa mt-1">
                What a redeeming customer typically spends in store
              </p>
            </div>
          </div>

          {/* Outputs */}
          <div className="bg-espresso text-parchment rounded-2xl p-6 sm:p-8 flex flex-col">
            <p className="text-sm uppercase tracking-widest opacity-70 mb-6">
              Estimated monthly impact
            </p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <AnimatedNumber
                  value={redemptions}
                  className="font-display text-4xl sm:text-5xl font-bold block"
                />
                <p className="text-sm opacity-70 mt-1">redemptions / visits</p>
              </div>
              <div>
                <AnimatedNumber
                  value={revenue}
                  format={usd}
                  className="font-display text-4xl sm:text-5xl font-bold block text-tangerine"
                />
                <p className="text-sm opacity-70 mt-1">revenue influenced</p>
              </div>
            </div>

            {/* Funnel bar: audience → redemptions */}
            <div className="mb-6">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <span>Local audience</span>
                <span>Claiming your deal</span>
              </div>
              <div className="h-3 rounded-full bg-parchment/15 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-sage"
                  animate={{ width: `${Math.min(appeal * 3, 100)}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-parchment/15">
              <div className="flex items-baseline justify-between">
                <span className="text-sm opacity-70">Annualized revenue influenced</span>
                <AnimatedNumber
                  value={annual}
                  format={usd}
                  className="font-display text-2xl font-bold"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-xs text-cocoa mt-6 max-w-2xl mx-auto"
          variants={fadeUp}
        >
          Illustrative only. Estimate = nearby dogs × your offer's appeal ×
          average spend. Actual results depend on your offer, pricing, and area
          activity. Dog parents spend Pack credits to redeem; those credits go to
          Pack — the value to you is the visit, the customer, and the spend.
        </motion.p>
      </motion.div>
    </section>
  );
}
