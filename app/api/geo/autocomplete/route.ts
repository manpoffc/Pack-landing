import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// US address autocomplete via the US Census Bureau geocoder — free, no API
// key, US-only by design, and far more accurate for specific US street
// addresses (incl. abbreviations like "63 E Lake St") than OSM/Photon, which
// mis-parsed them. It's a full-address matcher rather than a prefix typeahead,
// so suggestions appear once the typed address is complete enough to match.
// Each match returns parsed components + coordinates, so the vendor is
// geocoded at onboarding (M42 nearby-dogs works with no later geocode step).

type CensusMatch = {
  matchedAddress?: string;
  coordinates?: { x?: number; y?: number };
  addressComponents?: {
    city?: string;
    state?: string;
    zip?: string;
  };
};

// "63 E LAKE ST" → "63 E Lake St" (Census returns uppercase).
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 4) return NextResponse.json({ suggestions: [] });

  try {
    const url =
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress` +
      `?address=${encodeURIComponent(q)}&benchmark=Public_AR_Current&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PackVendorPortal/1.0 (hello@trypack.app)' },
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });

    const data = (await res.json()) as {
      result?: { addressMatches?: CensusMatch[] };
    };
    const matches = data.result?.addressMatches ?? [];

    const seen = new Set<string>();
    const suggestions = matches
      .map((m) => {
        const matched = m.matchedAddress ?? '';
        const lng = m.coordinates?.x;
        const lat = m.coordinates?.y;
        const c = m.addressComponents ?? {};
        // matchedAddress = "63 E LAKE ST, CHICAGO, IL, 60601"
        const line1 = titleCase((matched.split(',')[0] ?? '').trim());
        return {
          label: matched
            ? `${line1}, ${titleCase(c.city ?? '')}, ${(c.state ?? '').toUpperCase()} ${c.zip ?? ''}`.trim()
            : '',
          line1,
          city: titleCase(c.city ?? ''),
          state: (c.state ?? '').toUpperCase(),
          postal: c.zip ?? '',
          country: 'US',
          lat,
          lng,
        };
      })
      .filter(
        (s) =>
          typeof s.lat === 'number' &&
          typeof s.lng === 'number' &&
          s.line1 &&
          !seen.has(s.label) &&
          (seen.add(s.label), true),
      )
      .slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
