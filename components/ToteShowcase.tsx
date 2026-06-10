'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerParent } from '@/lib/motion';

// Tote showcase section. The SVG mirrors the locked design spec in
// src/features/tote/toteDesign.ts (natural colorway). Different code
// path (no react-native-svg) but same design.

export function ToteShowcase() {
  return (
    <section className="bg-parchment border-y border-sand overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid gap-12 grid-cols-1 lg:grid-cols-2 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerParent}
      >
        <motion.div variants={fadeUp}>
          <p className="text-sm uppercase tracking-widest text-tangerine mb-3">
            Founding Member tote
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Hand-printed canvas. Your dog's name. Yours when you walk.
          </h2>
          <p className="text-cocoa mb-4">
            The first 200 walkers get a heavyweight natural-canvas Pack tote with
            their dog's name screen-printed in the center. Locked typography, one
            variable — the name. Ships within ~4 weeks of your address
            confirmation.
          </p>
          <ul className="space-y-2 text-cocoa">
            <li>🎯 Top 200 = free. Everyone else = 1,000 credits.</li>
            <li>🪡 Heavyweight 12 oz canvas, screen-printed (no peel).</li>
            <li>🐕 12 characters max — works for almost every dog name.</li>
            <li>✋ One per Pack member.</li>
          </ul>
        </motion.div>
        <motion.div
          className="flex justify-center"
          variants={fadeUp}
          whileHover={{ rotate: -1.5, scale: 1.03 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Gentle hanging-from-the-handles float. */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 0.4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
          >
            <ToteSvg dogName="Yogi" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

const PALETTE = {
  canvas: '#e8ddc8',
  handle: '#c9a878',
  handleEdge: '#a88553',
  text: '#1a1410',
  accent: '#d2491e',
  wordmarkDot: '#3f6b4a',
  est: '#5c4f3e',
};

const NAME_SIZE = 100;
const NAME_EM_RATIO = 0.55;

function ToteSvg({ dogName, width = 340 }: { dogName: string; width?: number }) {
  const p = PALETTE;
  const VBOX_W = 800;
  const VBOX_H = 1000;
  const cx = VBOX_W / 2;
  const height = width * (VBOX_H / VBOX_W);

  const BAG = { x: 80, y: 220, w: VBOX_W - 160, h: VBOX_H - 260, r: 24 };
  const HANDLE_TOP = 60;
  const HANDLE_BOTTOM = BAG.y + 4;
  const leftHandleX = BAG.x + 110;
  const rightHandleX = BAG.x + BAG.w - 110;
  const HW = 130;

  const starPath = makeStar(cx, BAG.y + 290, 18);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className="max-w-full"
      viewBox={`0 0 ${VBOX_W} ${VBOX_H}`}
      role="img"
      aria-label={`Pack Founding Member tote, printed with the name ${dogName}`}
    >
      <defs>
        <pattern id="tote-weave" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="6" y2="0" stroke={p.text} strokeWidth="0.7" opacity="0.05" />
          <line x1="0" y1="0" x2="0" y2="6" stroke={p.text} strokeWidth="0.7" opacity="0.05" />
        </pattern>
      </defs>

      {/* Handles */}
      <path
        d={`M ${leftHandleX} ${HANDLE_BOTTOM} C ${leftHandleX} ${HANDLE_TOP + 20}, ${leftHandleX + HW} ${HANDLE_TOP + 20}, ${leftHandleX + HW} ${HANDLE_BOTTOM}`}
        stroke={p.handle}
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${leftHandleX} ${HANDLE_BOTTOM} C ${leftHandleX} ${HANDLE_TOP + 20}, ${leftHandleX + HW} ${HANDLE_TOP + 20}, ${leftHandleX + HW} ${HANDLE_BOTTOM}`}
        stroke={p.handleEdge}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d={`M ${rightHandleX - HW} ${HANDLE_BOTTOM} C ${rightHandleX - HW} ${HANDLE_TOP + 20}, ${rightHandleX} ${HANDLE_TOP + 20}, ${rightHandleX} ${HANDLE_BOTTOM}`}
        stroke={p.handle}
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${rightHandleX - HW} ${HANDLE_BOTTOM} C ${rightHandleX - HW} ${HANDLE_TOP + 20}, ${rightHandleX} ${HANDLE_TOP + 20}, ${rightHandleX} ${HANDLE_BOTTOM}`}
        stroke={p.handleEdge}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Bag */}
      <rect x={BAG.x} y={BAG.y} width={BAG.w} height={BAG.h} rx={BAG.r} ry={BAG.r} fill={p.canvas} />
      <rect x={BAG.x} y={BAG.y} width={BAG.w} height={BAG.h} rx={BAG.r} ry={BAG.r} fill="url(#tote-weave)" />

      {/* Wordmark — single text anchored at cx so "Pack." is centered. */}
      <text
        x={cx}
        y={BAG.y + 230}
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="700"
        fontSize="78"
        textAnchor="middle"
      >
        <tspan fill={p.accent}>Pack</tspan>
        <tspan fill={p.wordmarkDot}>.</tspan>
      </text>

      {/* Divider */}
      <line
        x1={cx - 16 - 110}
        y1={BAG.y + 290}
        x2={cx - 16}
        y2={BAG.y + 290}
        stroke={p.accent}
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path d={starPath} fill={p.accent} />
      <line
        x1={cx + 16}
        y1={BAG.y + 290}
        x2={cx + 16 + 110}
        y2={BAG.y + 290}
        stroke={p.accent}
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* FOUNDING MEMBER */}
      <text
        x={cx}
        y={BAG.y + 360}
        fill={p.accent}
        fontFamily="Outfit, system-ui, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="4"
        textAnchor="middle"
      >
        FOUNDING MEMBER
      </text>

      {/* Dog name — only shrink when overflowing. Without this guard,
          SVG textLength STRETCHES short names to fill the width. */}
      {(() => {
        const maxW = BAG.w - 120;
        const naturalWidth = dogName.length * NAME_SIZE * NAME_EM_RATIO;
        const overflowing = naturalWidth > maxW;
        return (
          <text
            x={cx}
            y={BAG.y + 480}
            fill={p.text}
            fontFamily="Fraunces, Georgia, serif"
            fontWeight="700"
            fontSize={NAME_SIZE}
            textAnchor="middle"
            {...(overflowing
              ? { textLength: maxW, lengthAdjust: 'spacingAndGlyphs' as const }
              : {})}
          >
            {dogName}
          </text>
        );
      })()}

      {/* EST. 2026 · CHICAGO */}
      <text
        x={cx}
        y={BAG.y + 560}
        fill={p.est}
        fontFamily="Outfit, system-ui, sans-serif"
        fontWeight="600"
        fontSize="18"
        letterSpacing="3"
        textAnchor="middle"
      >
        EST. 2026 · CHICAGO
      </text>
    </svg>
  );
}

function makeStar(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.4;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  points.push('Z');
  return points.join(' ');
}
