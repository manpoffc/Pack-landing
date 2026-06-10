// Renders inline store-badge buttons so they never 404, look intentional,
// and are perfectly centred in every parent. SVG assets in /public/icons
// are kept as a fallback, but these styled-JSX pills are the primary render.
//
// Set NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL to flip
// each button to its real store link and hide the "Coming soon" label.

export function StoreBadges() {
  const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';
  const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
  const liveApple = APP_STORE.length > 0;
  const liveAndroid = PLAY_STORE.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <StoreButton
        href={liveApple ? APP_STORE : '#waitlist'}
        icon={<AppleIcon />}
        label="App Store"
        prefix="Download on the"
        aria={liveApple ? 'Download on the App Store' : 'Coming soon to the App Store'}
        live={liveApple}
      />
      <StoreButton
        href={liveAndroid ? PLAY_STORE : '#waitlist'}
        icon={<PlayIcon />}
        label="Google Play"
        prefix="Get it on"
        aria={liveAndroid ? 'Get it on Google Play' : 'Coming soon to Google Play'}
        live={liveAndroid}
      />
    </div>
  );
}

function StoreButton({
  href,
  icon,
  label,
  prefix,
  aria,
  live,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  prefix: string;
  aria: string;
  live: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <a
        href={href}
        aria-label={aria}
        className="inline-flex items-center gap-3 bg-espresso text-parchment rounded-2xl px-5 py-3 hover:bg-cocoa hover:scale-[1.02] transition-all shadow-lg min-w-[180px] justify-center"
      >
        <span className="flex-shrink-0 opacity-90">{icon}</span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] opacity-70 uppercase tracking-wider">
            {prefix}
          </span>
          <span className="font-display text-lg font-semibold">{label}</span>
        </span>
      </a>
      {!live ? (
        <span className="text-[11px] uppercase tracking-[0.25em] text-cocoa text-center">
          Coming soon
        </span>
      ) : null}
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  );
}
