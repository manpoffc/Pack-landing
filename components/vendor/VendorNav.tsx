import Link from 'next/link';

// Vendor-page header. Same backdrop-blurred parchment bar as the main site
// Header, but the CTAs point at the vendor flow (#apply) instead of the
// consumer #waitlist anchor, and we surface a login link for existing
// partners (the authenticated portal lives at trypack.app/vendor).

const RUST = '#d2491e';
const MOSS = '#3f6b4a';

export function VendorNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-parchment/80 border-b border-sand/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Pack — home"
          className="inline-flex items-baseline font-display font-bold text-2xl leading-none tracking-tight hover:opacity-80 transition-opacity"
        >
          <span style={{ color: RUST }}>Pack</span>
          <span style={{ color: MOSS }}>.</span>
          <span className="ml-2 text-sm font-sans font-semibold text-cocoa self-center">
            for business
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <a
            href="https://trypack.app/vendor/login"
            className="hidden sm:inline text-sm font-medium text-cocoa hover:text-espresso transition-colors"
          >
            Vendor login
          </a>
          <a
            href="#apply"
            className="bg-tangerine text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Request an invite
          </a>
        </nav>
      </div>
    </header>
  );
}
