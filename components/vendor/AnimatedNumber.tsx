'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// A number that eases to its target whenever the target changes (slider drags,
// radius switches) and, optionally, counts up from zero the first time it
// scrolls into view. Shared by the impact estimator and the live demo panels.

type Props = {
  value: number;
  format?: (n: number) => string;
  className?: string;
  startOnView?: boolean;
  duration?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function AnimatedNumber({
  value,
  format,
  className,
  startOnView = false,
  duration = 0.6,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(startOnView ? 0 : value);
  const from = useRef(startOnView ? 0 : value);

  useEffect(() => {
    if (startOnView && !inView) return;
    const controls = animate(from.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, inView, startOnView, duration]);

  return (
    <span ref={ref} className={className}>
      {format ? format(display) : Math.round(display).toLocaleString()}
    </span>
  );
}
