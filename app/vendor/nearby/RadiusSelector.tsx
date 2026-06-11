'use client';

import { useRouter, usePathname } from 'next/navigation';

const RADIUS_OPTIONS = [
  { meters: 8047, label: '5 mi' },
  { meters: 16093, label: '10 mi' },
  { meters: 40234, label: '25 mi' },
] as const;

interface RadiusSelectorProps {
  current: number;
}

export default function RadiusSelector({ current }: RadiusSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-cocoa font-medium">Radius:</span>
      <div className="flex gap-1.5">
        {RADIUS_OPTIONS.map((opt) => {
          const isActive = opt.meters === current;
          return (
            <button
              key={opt.meters}
              onClick={() => router.push(`${pathname}?radius=${opt.meters}`)}
              className={`text-xs font-semibold rounded-full px-3 py-1 transition-colors ${
                isActive
                  ? 'bg-tangerine text-white'
                  : 'bg-sand text-cocoa hover:bg-tangerine/20'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
