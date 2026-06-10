import type { ReactNode } from 'react';

// Stylized phone frame for marketing illustrations. NOT real screenshots —
// the inner content is a design representation, not a recording. We label
// the surrounding section honestly ("Designed flow") so visitors don't
// expect pixel-perfect fidelity.

export function PhoneFrame({
  children,
  caption,
  step,
}: {
  children: ReactNode;
  caption: string;
  step: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase tracking-widest text-cocoa mb-3">
        {step}
      </div>
      <div className="relative w-[200px] h-[400px] sm:w-[240px] sm:h-[480px] rounded-[40px] bg-espresso p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-espresso rounded-b-2xl z-10" />
        <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-parchment">
          {children}
        </div>
      </div>
      <p className="mt-4 text-center text-cocoa max-w-[200px] sm:max-w-[240px] text-sm">{caption}</p>
    </div>
  );
}
