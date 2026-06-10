// Renders the pasted vendor wordmarks (just "App Store" / "Google Play")
// inside dark button containers so they read as real install buttons,
// and shows a "Coming soon" caption below each one with breathing room
// until the apps are live in their stores.
//
// Set NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL to flip
// each button to its real store link and hide the "Coming soon" label.

export function StoreBadges() {
  const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '';
  const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '';
  const liveApple = APP_STORE.length > 0;
  const liveAndroid = PLAY_STORE.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-8 justify-center items-start">
      <StoreButton
        href={liveApple ? APP_STORE : '#waitlist'}
        iconSrc="/icons/app-store-badge.svg"
        label="App Store"
        prefix="Download on the"
        aria={liveApple ? 'Download on the App Store' : 'Coming soon to the App Store'}
        live={liveApple}
      />
      <StoreButton
        href={liveAndroid ? PLAY_STORE : '#waitlist'}
        iconSrc="/icons/google-play-badge.svg"
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
  iconSrc,
  label,
  prefix,
  aria,
  live,
}: {
  href: string;
  iconSrc: string;
  label: string;
  prefix: string;
  aria: string;
  live: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <a
        href={href}
        aria-label={aria}
        className="inline-flex items-center gap-3 bg-espresso text-parchment rounded-2xl px-6 py-3 hover:bg-cocoa hover:scale-[1.02] transition-all shadow-lg min-w-[200px] justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          style={{ height: 36, width: 'auto' }}
        />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] opacity-70 uppercase tracking-wider">
            {prefix}
          </span>
          <span className="font-display text-lg font-semibold">{label}</span>
        </span>
      </a>
      {!live ? (
        <span className="mt-5 text-[11px] uppercase tracking-[0.25em] text-cocoa">
          Coming soon
        </span>
      ) : null}
    </div>
  );
}
