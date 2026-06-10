import Link from 'next/link';

// Sticky header with the Pack wordmark on the left and a waitlist CTA on
// the right. Backdrop-blurred so it sits cleanly over the parchment hero
// without a hard color seam.
//
// Wordmark uses the exact tote print colors (rust + moss) so the brand
// reads as one continuous identity from the site through the merch.

const RUST = '#d2491e';
const MOSS = '#3f6b4a';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-parchment/80 border-b border-sand/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Pack — home"
          className="inline-flex items-baseline font-display font-bold text-2xl leading-none tracking-tight hover:opacity-80 transition-opacity"
        >
          <span style={{ color: RUST }}>Pack</span>
          <span style={{ color: MOSS }}>.</span>
        </Link>
        <a
          href="#waitlist"
          className="text-sm font-semibold text-espresso hover:text-[#d2491e] transition-colors"
        >
          Join waitlist
          <span aria-hidden="true" className="ml-1">↓</span>
        </a>
      </div>
    </header>
  );
}
