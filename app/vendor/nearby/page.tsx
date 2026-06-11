import type { Metadata } from 'next';
import Link from 'next/link';
import { requireActiveVendor } from '@/lib/vendorSession';
import { supabaseAdmin } from '@/lib/supabase';
import { vendorServerClient } from '@/lib/supabaseVendor';
import { geocodeAddress } from '@/lib/geocode';
import ManualGeo from './ManualGeo';
import RadiusSelector from './RadiusSelector';

export const metadata: Metadata = {
  title: 'Dogs near you — Pack Vendor Portal',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Valid radius values (meters)
const VALID_RADII = [8047, 16093, 40234] as const;
type ValidRadius = (typeof VALID_RADII)[number];

function metersToMiles(m: number): number {
  return Math.round(m / 1609.34);
}

// Shape returned by the RPC when there IS enough data
type NearbyDogsData = {
  below_threshold: false;
  total: number;
  by_size: { size: string; count: number }[];
  by_breed: { breed: string; count: number }[];
  by_age_band: { band: string; count: number }[];
  radius_meters: number;
  as_of: string;
};

type NearbyDogsResult =
  | { below_threshold: true; total: 0 }
  | NearbyDogsData;

// Horizontal bar row — pure, no client JS needed
function HorizontalBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-cocoa truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-3 bg-sand rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-tangerine"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-espresso shrink-0">
        {count}
      </span>
    </div>
  );
}

function BreakdownPanel({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; count: number }[];
  total: number;
}) {
  return (
    <div className="bg-cream border border-sand rounded-2xl p-5 flex flex-col gap-3">
      <h3 className="font-display font-bold text-espresso text-sm uppercase tracking-wide">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-cocoa">No data available.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ label, count }) => (
            <HorizontalBar key={label} label={label} count={count} total={total} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function VendorNearbyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const result = await requireActiveVendor();

  if (!result.ok) {
    if (result.reason === 'not_a_vendor') {
      return (
        <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center">
            <h1 className="font-display text-2xl font-bold text-espresso mb-4">Not a vendor</h1>
            <p className="text-cocoa text-sm">
              This account is not registered as a Pack vendor. Contact{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>
              .
            </p>
          </div>
        </main>
      );
    }

    const statusLabel = result.status === 'suspended' ? 'suspended' : 'cancelled';
    return (
      <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="font-display text-2xl font-bold text-espresso mb-4">
            Membership {statusLabel}
          </h1>
          <p className="text-cocoa text-sm">
            Your vendor membership is currently{' '}
            <span className="font-semibold">{statusLabel}</span>. Contact{' '}
            <a href="mailto:hello@trypack.app" className="text-tangerine underline">
              hello@trypack.app
            </a>{' '}
            if you have questions.
          </p>
        </div>
      </main>
    );
  }

  // Parse radius from searchParams (default 16093 = 10 mi)
  const rawRadius = Array.isArray(searchParams.radius)
    ? searchParams.radius[0]
    : searchParams.radius;
  const parsedRadius = parseInt(rawRadius ?? '', 10);
  const radius: ValidRadius = (VALID_RADII as readonly number[]).includes(parsedRadius)
    ? (parsedRadius as ValidRadius)
    : 16093;

  // Read the freshest vendor row (requireActiveVendor already holds a snapshot,
  // but after a geocode attempt we need the updated lat/lng).
  let vendor = result.vendor;

  // Auto-geocode ONCE, only if we've never tried (geocoded_at null). Stamping
  // geocoded_at on both success and failure stops a vendor whose address can't
  // be resolved from re-hitting Nominatim on every page load (OSM rate policy).
  if ((vendor.lat == null || vendor.lng == null) && vendor.geocoded_at == null) {
    const geo = await geocodeAddress({
      line1: vendor.address_line1 as string | null,
      line2: vendor.address_line2 as string | null,
      city: vendor.city as string | null,
      state: vendor.state as string | null,
      postal: vendor.postal_code as string | null,
      country: vendor.country as string | null,
    });

    const admin = supabaseAdmin();
    await admin
      .from('vendors')
      .update({
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        geocoded_at: new Date().toISOString(),
      })
      .eq('id', vendor.id);

    // Re-read to get the updated row
    const { data: fresh } = await admin
      .from('vendors')
      .select('*')
      .eq('id', vendor.id)
      .single();
    if (fresh) vendor = fresh as typeof vendor;
  }

  // Build address string for display
  const addressParts = [
    vendor.address_line1,
    vendor.address_line2,
    vendor.city,
    vendor.state,
    vendor.postal_code,
    vendor.country,
  ]
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .join(', ');

  // If STILL no lat/lng, show the manual fallback
  if (vendor.lat == null || vendor.lng == null) {
    return (
      <main className="bg-parchment min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
              Dashboard
            </Link>
            <span className="text-sand">/</span>
            <span className="text-espresso font-semibold">Dogs near you</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-espresso mb-4">Dogs near you</h1>
          <div className="bg-cream border border-sand rounded-2xl p-6">
            <p className="font-semibold text-espresso mb-2">
              We could not locate your business address
            </p>
            <p className="text-sm text-cocoa mb-4">
              We tried to look up your address automatically but could not find coordinates for it.
              To show nearby dog activity, we need your exact location.
            </p>
            {addressParts && (
              <div className="bg-parchment rounded-lg px-4 py-3 text-sm text-cocoa mb-4">
                <p className="text-xs font-semibold text-cocoa uppercase tracking-wide mb-1">
                  Address on file
                </p>
                <p>{addressParts}</p>
              </div>
            )}
            <p className="text-sm text-cocoa">
              You can enter your coordinates manually below. You can find them by searching your
              address on{' '}
              <a
                href="https://www.openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tangerine underline"
              >
                OpenStreetMap
              </a>{' '}
              or{' '}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tangerine underline"
              >
                Google Maps
              </a>
              .
            </p>
            <ManualGeo />
          </div>
        </div>
      </main>
    );
  }

  // Call the RPC
  const supabase = vendorServerClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc('vendor_nearby_dogs', {
    p_radius_meters: radius,
  });

  // Handle RPC errors (service area not located yet / not an active vendor)
  if (rpcError) {
    return (
      <main className="bg-parchment min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
              Dashboard
            </Link>
            <span className="text-sand">/</span>
            <span className="text-espresso font-semibold">Dogs near you</span>
          </nav>
          <div className="bg-brick/10 border border-brick/30 rounded-xl p-4 text-sm text-brick">
            <p className="font-semibold mb-1">Could not load nearby data</p>
            <p>{rpcError.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const nearbyResult = rpcData as NearbyDogsResult;

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
            Dashboard
          </Link>
          <span className="text-sand">/</span>
          <span className="text-espresso font-semibold">Dogs near you</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl font-bold text-espresso">Dogs near you</h1>
          <RadiusSelector current={radius} />
        </div>

        {nearbyResult.below_threshold ? (
          /* Below-threshold privacy card */
          <div className="bg-cream border border-sand rounded-2xl p-10 text-center">
            <p className="text-4xl mb-4">🐾</p>
            <p className="font-display font-bold text-espresso text-xl mb-3">
              Not enough activity in this area yet
            </p>
            <p className="text-sm text-cocoa max-w-md mx-auto mb-6">
              To protect walker privacy, we only show stats when at least 5 dogs from 3 or more
              households have walked here recently. Check back as more walkers join Pack in your
              neighborhood.
            </p>
            <p className="text-xs text-cocoa">
              Try a larger radius using the selector above, or check back soon.
            </p>
          </div>
        ) : (
          /* Full dashboard */
          <>
            {/* Hero count */}
            <div className="bg-cream border border-sand rounded-2xl p-8 text-center mb-6">
              <p className="font-display text-6xl font-bold text-tangerine leading-none mb-2">
                {nearbyResult.total.toLocaleString()}
              </p>
              <p className="font-display text-xl font-bold text-espresso">
                dogs active near you
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-cocoa">
                <span>Within {metersToMiles(nearbyResult.radius_meters)} miles</span>
                <span>&middot;</span>
                <span>
                  As of{' '}
                  {new Date(nearbyResult.as_of).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Privacy disclaimer */}
            <div className="flex items-start gap-2 bg-parchment border border-sand rounded-xl px-4 py-3 mb-6 text-xs text-cocoa">
              <span className="mt-0.5 shrink-0">🔒</span>
              <p>
                <span className="font-semibold">Anonymized data</span> — no names, owners, or
                locations are shared. Counts only. Areas with fewer than 5 dogs or 3 households
                are hidden automatically.
              </p>
            </div>

            {/* Breakdown panels */}
            <div className="grid gap-4 sm:grid-cols-3">
              <BreakdownPanel
                title="By Size"
                rows={nearbyResult.by_size.map((r) => ({ label: r.size, count: r.count }))}
                total={nearbyResult.total}
              />
              <BreakdownPanel
                title="By Breed"
                rows={nearbyResult.by_breed.map((r) => ({ label: r.breed, count: r.count }))}
                total={nearbyResult.total}
              />
              <BreakdownPanel
                title="By Age"
                rows={nearbyResult.by_age_band.map((r) => ({ label: r.band, count: r.count }))}
                total={nearbyResult.total}
              />
            </div>
          </>
        )}

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
