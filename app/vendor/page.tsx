import type { Metadata } from 'next';
import { requireActiveVendor } from '@/lib/vendorSession';
import SignOutButton from './SignOutButton';

export const metadata: Metadata = {
  title: 'Vendor Portal — Pack',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const comingSoonCards: { title: string; description: string; icon: string }[] = [];

export default async function VendorDashboardPage() {
  const result = await requireActiveVendor();

  if (!result.ok) {
    if (result.reason === 'not_a_vendor') {
      return (
        <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center">
            <h1 className="font-display text-2xl font-bold text-espresso mb-4">
              Not a vendor
            </h1>
            <p className="text-cocoa text-sm">
              This account is not registered as a Pack vendor. If you think this
              is a mistake, contact{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>
              .
            </p>
          </div>
        </main>
      );
    }

    // Suspended or cancelled
    const statusLabel =
      result.status === 'suspended' ? 'suspended' : 'cancelled';
    return (
      <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="font-display text-2xl font-bold text-espresso mb-4">
            Membership {statusLabel}
          </h1>
          <p className="text-cocoa text-sm">
            Your vendor membership is currently{' '}
            <span className="font-semibold">{statusLabel}</span>. Please contact{' '}
            <a href="mailto:hello@trypack.app" className="text-tangerine underline">
              hello@trypack.app
            </a>{' '}
            if you have questions.
          </p>
        </div>
      </main>
    );
  }

  const { vendor } = result;

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            {vendor.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.logo_url as string}
                alt={`${vendor.business_name} logo`}
                className="h-16 w-16 rounded-xl object-contain border border-sand bg-cream"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-cream border border-sand flex items-center justify-center text-2xl">
                🏪
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-espresso">
                {vendor.business_name}
              </h1>
              <p className="text-sm text-cocoa mt-0.5">
                Welcome to your vendor portal
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Feature cards */}
        <section>
          <h2 className="font-display text-xl font-bold text-espresso mb-5">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Deals — live */}
            <a
              href="/vendor/deals"
              className="bg-cream border border-sand rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl" role="img" aria-label="Deals">
                🏷️
              </span>
              <div>
                <h3 className="font-display font-bold text-espresso text-base group-hover:text-tangerine transition-colors">
                  Deals
                </h3>
                <p className="text-xs text-cocoa mt-1 leading-relaxed">
                  Create and manage exclusive deals for Pack dog walkers.
                </p>
              </div>
              <span className="text-xs font-semibold text-white bg-tangerine rounded-full px-2.5 py-1 self-start">
                Manage &rarr;
              </span>
            </a>

            {/* Analytics — live */}
            <a
              href="/vendor/analytics"
              className="bg-cream border border-sand rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl" role="img" aria-label="Analytics">
                📊
              </span>
              <div>
                <h3 className="font-display font-bold text-espresso text-base group-hover:text-tangerine transition-colors">
                  Analytics
                </h3>
                <p className="text-xs text-cocoa mt-1 leading-relaxed">
                  See how many walkers have viewed and redeemed your deals.
                </p>
              </div>
              <span className="text-xs font-semibold text-white bg-tangerine rounded-full px-2.5 py-1 self-start">
                View &rarr;
              </span>
            </a>

            {/* Nearby Dogs — live */}
            <a
              href="/vendor/nearby"
              className="bg-cream border border-sand rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl" role="img" aria-label="Nearby Dogs">
                🐾
              </span>
              <div>
                <h3 className="font-display font-bold text-espresso text-base group-hover:text-tangerine transition-colors">
                  Nearby Dogs
                </h3>
                <p className="text-xs text-cocoa mt-1 leading-relaxed">
                  See anonymized stats on Pack dogs active near your location.
                </p>
              </div>
              <span className="text-xs font-semibold text-white bg-tangerine rounded-full px-2.5 py-1 self-start">
                View &rarr;
              </span>
            </a>

            {comingSoonCards.map((card) => (
              <div
                key={card.title}
                className="bg-cream border border-sand rounded-2xl p-6 flex flex-col gap-3"
              >
                <span className="text-3xl" role="img" aria-label={card.title}>
                  {card.icon}
                </span>
                <div>
                  <h3 className="font-display font-bold text-espresso text-base">
                    {card.title}
                  </h3>
                  <p className="text-xs text-cocoa mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-cocoa bg-sand rounded-full px-2.5 py-1 self-start">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-10 text-xs text-cocoa text-center">
          Questions? Email us at{' '}
          <a href="mailto:hello@trypack.app" className="text-tangerine underline">
            hello@trypack.app
          </a>
        </p>
      </div>
    </main>
  );
}
