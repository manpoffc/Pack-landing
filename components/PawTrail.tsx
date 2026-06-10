'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

// Marauder's-Map style paw trail. Several invisible "walkers" pace
// across the hero section in parallel. Each walker:
//
//   1. Spawns at a random position with a random heading.
//   2. Lays down a short trail of paw PAIRS (left + right footprint),
//      one pair per beat, each pair fading out as the next appears.
//   3. After the trail finishes + a short rest, the walker is reborn at
//      a NEW random location with a new heading.
//
// Multiple walkers run in parallel so the section always has motion.
// Opacity stays low so the hero copy reads clearly.

const W = 1600;
const H = 760;
const WALKER_COUNT = 5;
const PEAK_OPACITY = 0.13;
const BEAT_CADENCE = 0.55;   // seconds between footfalls
const PAW_LIFETIME = 4.5;    // a paw's full fade-in + hold + fade-out
const MIN_REST = 2;          // seconds between a walker's trails
const MAX_REST = 5;

// Single-paw alternating-side trail (left, right, left, right). This is
// the classic dog-tracks-in-snow pattern — one print per footfall,
// alternating which side of the centerline it sits on. Stride is large
// enough that consecutive prints never overlap.
const STRIDE = { min: 56, max: 76 };
const LATERAL_OFFSET = 13;

type Paw = { x: number; y: number; rotation: number };
type Walk = {
  paws: Paw[];
  cycleSec: number;
  restSec: number;
};

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateWalk(): Walk {
  // 6..10 footfalls. Sparse on purpose — fewer prints, more space.
  const beatCount = 6 + Math.floor(rand(0, 5));
  const stride = rand(STRIDE.min, STRIDE.max);
  const curvature = rand(-0.18, 0.18);
  const headingRad = rand(0, Math.PI * 2);
  const startX = rand(180, W - 180);
  const startY = rand(140, H - 200);

  const paws: Paw[] = [];
  let x = startX;
  let y = startY;
  let h = headingRad;

  for (let i = 0; i < beatCount; i++) {
    const perpCos = Math.cos(h + Math.PI / 2);
    const perpSin = Math.sin(h + Math.PI / 2);
    const headingDeg = (h * 180) / Math.PI;
    // Alternate sides each footfall.
    const latSign = i % 2 === 0 ? -1 : 1;

    paws.push({
      x: x + perpCos * (latSign * LATERAL_OFFSET),
      y: y + perpSin * (latSign * LATERAL_OFFSET),
      rotation: headingDeg + 90,
    });

    x += Math.cos(h) * stride;
    y += Math.sin(h) * stride;
    h += curvature;
  }

  const cycleSec = (paws.length - 1) * BEAT_CADENCE + PAW_LIFETIME;
  const restSec = rand(MIN_REST, MAX_REST);
  return { paws, cycleSec, restSec };
}

export function PawTrail() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        {reduced ? (
          <StaticPaws />
        ) : (
          Array.from({ length: WALKER_COUNT }, (_, i) => (
            <Walker key={i} initialDelay={i * 0.9} />
          ))
        )}
      </svg>
    </div>
  );
}

// One walker that paces, rests, then respawns at a new random spot.
// Re-keying the inner <g> on the trail index forces framer-motion to
// remount the paws, so the new trail plays its fade-in from scratch.
function Walker({ initialDelay }: { initialDelay: number }) {
  const [trail, setTrail] = useState<Walk>(() => generateWalk());
  const [iter, setIter] = useState(0);
  const [armed, setArmed] = useState(false);

  // Initial offset so walkers don't all start in sync.
  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), initialDelay * 1000);
    return () => window.clearTimeout(t);
  }, [initialDelay]);

  // After each cycle + rest, regenerate.
  useEffect(() => {
    if (!armed) return;
    const total = (trail.cycleSec + trail.restSec) * 1000;
    const t = window.setTimeout(() => {
      setTrail(generateWalk());
      setIter((n) => n + 1);
    }, total);
    return () => window.clearTimeout(t);
  }, [armed, trail, iter]);

  if (!armed) return null;

  return (
    <g key={iter}>
      {trail.paws.map((paw, i) => (
        <AnimatedPaw key={i} paw={paw} delay={i * BEAT_CADENCE} />
      ))}
    </g>
  );
}

function AnimatedPaw({ paw, delay }: { paw: Paw; delay: number }) {
  // Outer <g> handles SVG translate+rotate. Inner <motion.g> handles
  // opacity + scale via CSS transform. Splitting them avoids motion's
  // CSS transform overriding the SVG transform attribute (which would
  // stack every paw at the origin and clip them out of view).
  return (
    <g
      transform={`translate(${paw.x.toFixed(1)} ${paw.y.toFixed(1)}) rotate(${paw.rotation.toFixed(1)})`}
    >
      <motion.g
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: [0, PEAK_OPACITY, PEAK_OPACITY, 0],
          scale: [0.7, 1, 1, 0.95],
        }}
        transition={{
          duration: PAW_LIFETIME,
          times: [0, 0.12, 0.78, 1],
          delay,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center' }}
      >
        <PawShape />
      </motion.g>
    </g>
  );
}

// Static rendering for prefers-reduced-motion. A small sample of paws
// at low opacity so the section still feels themed.
function StaticPaws() {
  const sample = useMemo(() => {
    const out: Paw[] = [];
    for (let i = 0; i < 18; i++) {
      out.push({
        x: rand(80, W - 80),
        y: rand(80, H - 80),
        rotation: rand(0, 360),
      });
    }
    return out;
  }, []);
  return (
    <>
      {sample.map((p, i) => (
        <g
          key={i}
          transform={`translate(${p.x} ${p.y}) rotate(${p.rotation})`}
          opacity={PEAK_OPACITY * 0.6}
        >
          <PawShape />
        </g>
      ))}
    </>
  );
}

// 4-toed paw print: rounded main pad + four toe beans above it.
// Drawn at origin pointing "up" (negative Y) so the rotation in
// AnimatedPaw aligns the paw with the walker's heading.
function PawShape() {
  const color = '#3D2A1F'; // espresso — opacity controls how visible it is
  return (
    <g fill={color}>
      <ellipse cx="0" cy="7" rx="11" ry="9" />
      <ellipse cx="-11" cy="-6" rx="3.6" ry="4.2" transform="rotate(-25 -11 -6)" />
      <ellipse cx="-4" cy="-11" rx="3.6" ry="4.4" transform="rotate(-8 -4 -11)" />
      <ellipse cx="4" cy="-11" rx="3.6" ry="4.4" transform="rotate(8 4 -11)" />
      <ellipse cx="11" cy="-6" rx="3.6" ry="4.2" transform="rotate(25 11 -6)" />
    </g>
  );
}
