export function Footer() {
  return (
    <footer className="bg-espresso text-parchment">
      <div className="max-w-5xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">Pack</p>
          <p className="text-sm opacity-70 mt-2">Walks worth showing up for.</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Honest about</p>
          <ul className="text-sm opacity-70 space-y-1">
            <li>Real GPS-verified walks only</li>
            <li>Breed targets are guidance, not vet advice</li>
            <li>Charity items are pledges; we batch payouts</li>
            <li>Park data © OpenStreetMap contributors</li>
          </ul>
        </div>
        <div className="text-sm opacity-70">
          <p className="font-semibold text-parchment mb-2">Get in touch</p>
          <p>hello@trypack.app</p>
          <p className="mt-2">
            <a href="/vendors" className="hover:opacity-100 underline">
              Pack for business →
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-parchment/10 py-4 text-center text-xs opacity-60">
        <p>© {new Date().getFullYear()} Pack. Made for dogs and the humans who walk them.</p>
        <p className="mt-1 space-x-4">
          <a href="/privacy" className="hover:opacity-100 underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:opacity-100 underline">
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
}
