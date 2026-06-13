'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';
import { AnimatedNumber } from './AnimatedNumber';

// The three product pillars of the vendor portal (M40 Deals, M41 Analytics,
// M42 Nearby-Dogs insights). Each pillar's panel is a small LIVE demo the
// visitor can poke — claim a deal, replay the chart, switch radius/dimension —
// so the value is felt, not just described. All sample data, labelled as such.

const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------- Deals demo ----------------------------- */

const CODE_TOTAL = 60;

function DealPanel() {
  const [claimed, setClaimed] = useState(41);
  const pct = (claimed / CODE_TOTAL) * 100;
  const soldOut = claimed >= CODE_TOTAL;

  return (
    <div className="bg-parchment border border-sand rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-espresso">
          20% off your first grooming
        </span>
        <span className="text-xs font-semibold text-white bg-sage px-2 py-1 rounded-full">
          {soldOut ? 'Sold out' : 'Live'}
        </span>
      </div>
      <p className="text-sm text-cocoa">Bath &amp; tidy for one happy dog.</p>

      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1 text-espresso font-semibold">
          ◆ 150 credits
        </span>
        <span className="text-cocoa">
          <AnimatedNumber value={claimed} /> / {CODE_TOTAL} codes claimed
        </span>
      </div>

      <div className="h-2 rounded-full bg-cream overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-tangerine"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      <button
        onClick={() => setClaimed((c) => Math.min(c + 1, CODE_TOTAL))}
        disabled={soldOut}
        className="w-full text-sm font-semibold rounded-full py-2 bg-espresso text-parchment hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {soldOut ? 'All codes claimed' : '＋ Simulate a redemption'}
      </button>
    </div>
  );
}

/* --------------------------- Analytics demo --------------------------- */

const TREND = [30, 52, 41, 68, 80, 62, 95, 74, 88, 60, 102, 84];

function AnalyticsPanel() {
  const [runId, setRunId] = useState(0);
  const total = 218;
  const maxBar = Math.max(...TREND);

  return (
    <div className="bg-parchment border border-sand rounded-xl p-4 space-y-4">
      <div className="flex gap-6">
        <div>
          <AnimatedNumber
            value={total}
            startOnView
            className="font-display text-3xl font-bold text-espresso block"
          />
          <p className="text-xs text-cocoa">redemptions</p>
        </div>
        <div>
          <span className="font-display text-3xl font-bold text-espresso block">3</span>
          <p className="text-xs text-cocoa">live deals</p>
        </div>
      </div>

      <div key={runId} className="flex items-end gap-1.5 h-24">
        {TREND.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-tangerine"
            initial={{ height: 0 }}
            whileInView={{ height: `${(h / maxBar) * 100}%` }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
            style={{ opacity: 0.55 + (i / TREND.length) * 0.45 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-cocoa">last 30 days · daily redemptions</p>
        <button
          onClick={() => setRunId((r) => r + 1)}
          className="text-xs font-semibold text-tangerine hover:underline"
        >
          ↻ Replay
        </button>
      </div>
    </div>
  );
}

/* -------------------------- Nearby-dogs demo -------------------------- */

type Dim = 'size' | 'breed' | 'age';

const NEARBY: Record<
  number,
  { total: number; size: [string, number][]; breed: [string, number][]; age: [string, number][] }
> = {
  5: {
    total: 71,
    size: [['Small', 31], ['Medium', 24], ['Large', 13], ['Giant', 3]],
    breed: [['Mixed', 22], ['Labrador', 9], ['Frenchie', 7], ['Poodle', 6], ['Other', 27]],
    age: [['Puppy', 12], ['Young', 28], ['Adult', 24], ['Senior', 7]],
  },
  10: {
    total: 182,
    size: [['Small', 71], ['Medium', 64], ['Large', 38], ['Giant', 9]],
    breed: [['Mixed', 54], ['Labrador', 23], ['Frenchie', 18], ['Poodle', 15], ['Other', 72]],
    age: [['Puppy', 29], ['Young', 71], ['Adult', 61], ['Senior', 21]],
  },
  25: {
    total: 540,
    size: [['Small', 206], ['Medium', 188], ['Large', 116], ['Giant', 30]],
    breed: [['Mixed', 162], ['Labrador', 68], ['Frenchie', 49], ['Poodle', 44], ['Other', 217]],
    age: [['Puppy', 86], ['Young', 210], ['Adult', 183], ['Senior', 61]],
  },
};

const DIMS: { key: Dim; label: string }[] = [
  { key: 'size', label: 'Size' },
  { key: 'breed', label: 'Breed' },
  { key: 'age', label: 'Age' },
];
const RADII = [5, 10, 25] as const;

function NearbyPanel() {
  const [radius, setRadius] = useState<number>(10);
  const [dim, setDim] = useState<Dim>('size');
  const data = NEARBY[radius];
  const rows = data[dim];
  const max = Math.max(...rows.map((r) => r[1]), 1);

  return (
    <div className="bg-parchment border border-sand rounded-xl p-4 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <AnimatedNumber
            value={data.total}
            className="font-display text-3xl font-bold text-espresso block"
          />
          <p className="text-xs text-cocoa">dogs active within {radius} mi</p>
        </div>
        <div className="flex gap-1">
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
                radius === r ? 'bg-tangerine text-white' : 'bg-cream text-cocoa hover:text-espresso'
              }`}
            >
              {r}mi
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 bg-cream rounded-full p-1">
        {DIMS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDim(d.key)}
            className={`flex-1 text-xs font-semibold rounded-full py-1.5 transition-colors ${
              dim === d.key ? 'bg-parchment text-espresso shadow-sm' : 'text-cocoa hover:text-espresso'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="space-y-2" key={dim + radius}>
        {rows.map(([label, v]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-cocoa w-16 shrink-0">{label}</span>
            <div className="flex-1 h-3 rounded-full bg-cream overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-sage"
                initial={{ width: 0 }}
                animate={{ width: `${(v / max) * 100}%` }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </div>
            <span className="text-xs text-cocoa w-8 text-right tabular-nums">
              <AnimatedNumber value={v} />
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-cocoa">
        Anonymized · counts only · no names, owners, or locations
      </p>
    </div>
  );
}

/* ------------------------------ Pillars ------------------------------ */

type Pillar = {
  tag: string;
  title: string;
  body: string;
  points: string[];
  panel: React.ReactNode;
};

const PILLARS: Pillar[] = [
  {
    tag: 'Deals',
    title: 'Launch an offer in minutes.',
    body:
      "Create a credit-gated deal and it auto-publishes straight to the in-app marketplace under your business name. Walkers spend the credits they've earned to claim it — and you decide the terms.",
    points: [
      'Title, description, image, and the credit cost — live the moment you publish.',
      'Upload your own pool of redemption codes; each claim hands a walker the next unused one.',
      'Cap inventory to run a limited drop, or leave it unlimited.',
      'Toggle a deal on or off anytime, and run as many as you like.',
    ],
    panel: <DealPanel />,
  },
  {
    tag: 'Analytics',
    title: 'Know exactly what your offer did.',
    body:
      'Redemptions are your foot-traffic signal — real people who claimed a deal to come see you. Track them per deal and across your whole storefront, day by day.',
    points: [
      'Total redemptions across every deal, and a 30-day trend for each one.',
      'Codes used vs. remaining, with a heads-up before a live deal runs dry.',
      'Engagement view: the total credits your customers chose to spend with you.',
      'Aggregates only — you never see who redeemed, just how many.',
    ],
    panel: <AnalyticsPanel />,
  },
  {
    tag: 'Nearby Dogs',
    title: 'Understand your audience — privately.',
    body:
      "An anonymized read on the dogs whose owners are actually active around your address. No names, no owners, no pins — just the shape of the audience so you can plan with it.",
    points: [
      'How many dogs are active in your service area (5, 10, or 25 miles).',
      'Breakdowns by size, breed, and age band — the mix of dogs near you.',
      'Strict privacy floor: areas with fewer than five dogs show nothing at all.',
      'Rare breeds roll into "Other" so no single household can be singled out.',
    ],
    panel: <NearbyPanel />,
  },
];

export function VendorOffer() {
  return (
    <section id="offer" className="max-w-5xl mx-auto px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerParent}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          variants={fadeUp}
        >
          Everything you get in the vendor portal.
        </motion.h2>
        <motion.p
          className="text-cocoa text-center max-w-2xl mx-auto mb-4"
          variants={fadeUp}
        >
          One simple dashboard at <span className="font-mono">trypack.app/vendor</span> —
          deals to bring people in, analytics to prove it worked, and audience
          insights to plan what's next.
        </motion.p>
        <motion.p
          className="text-center text-xs uppercase tracking-widest text-tangerine font-semibold mb-16"
          variants={fadeUp}
        >
          ↓ These panels are live — try them
        </motion.p>

        <div className="space-y-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.tag}
              className="grid gap-8 md:grid-cols-2 md:items-center"
              variants={fadeUp}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <p className="text-sm uppercase tracking-widest text-tangerine font-semibold mb-2">
                  {p.tag}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                  {p.title}
                </h3>
                <p className="text-cocoa mb-4">{p.body}</p>
                <ul className="space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-espresso">
                      <span className="text-sage mt-0.5">✓</span>
                      <span className="text-sm">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>{p.panel}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
