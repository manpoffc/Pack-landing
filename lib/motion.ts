// Shared motion variants. Keeping them centralized so the rhythm is
// consistent across sections — same ease, same durations, same offsets.
// If you tweak the feel, do it here.

import type { Variants } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const; // expo-out — soft, expensive feel
export const DUR = 0.6;

// Fade up — for headlines and content blocks.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
};

// Fade up with a slower, larger offset — for hero headlines.
export const heroUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

// Container that staggers its children.
export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

// Card hover scale used on phone mockups + feature tiles.
export const tileHover = {
  scale: 1.02,
  transition: { duration: 0.25, ease: EASE },
};
