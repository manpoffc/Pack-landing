import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// US-only address autocomplete proxied through Photon (photon.komoot.io) — a
// free, no-API-key, OSM-based geocoder built for type-ahead. Proxying keeps the
// descriptive User-Agent server-side (OSM etiquette) and avoids browser CORS.
// We bias toward the US geographic center, then HARD-filter to countrycode US,
// and rank street-level addresses above cities/regions so the suggestions are
// real mailing addresses. Selecting one also captures lat/lng (geocoded at
// onboarding, so M42 nearby-dogs works without a later geocode).

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | undefined>;
};

// Geographic center of the contiguous US — a soft relevance bias, not a filter.
const US_LAT = 39.83;
const US_LON = -98.58;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 3) return NextResponse.json({ suggestions: [] });

  try {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
      `&limit=10&lang=en&lat=${US_LAT}&lon=${US_LON}&location_bias_scale=0.6`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PackVendorPortal/1.0 (hello@trypack.app)' },
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });

    const data = (await res.json()) as { features?: PhotonFeature[] };

    const mapped = (data.features ?? [])
      .map((f) => {
        const p = f.properties ?? {};
        const [lng, lat] = f.geometry?.coordinates ?? [undefined, undefined];
        const street = p.street ?? p.name ?? '';
        const line1 = [p.housenumber, street].filter(Boolean).join(' ').trim();
        const city = p.city ?? p.town ?? p.village ?? p.locality ?? '';
        const country = (p.countrycode ?? '').toUpperCase();
        const label = [line1 || p.name, city, p.state, p.postcode]
          .filter(Boolean)
          .join(', ');
        // Rank: full street address (house # + street) > street/POI > area only.
        const rank = p.housenumber && street ? 0 : street ? 1 : 2;
        return {
          label,
          line1: line1 || p.name || '',
          city,
          state: p.state ?? '',
          postal: p.postcode ?? '',
          country,
          lat,
          lng,
          rank,
        };
      })
      // HARD US-only filter + must have coords + a label.
      .filter(
        (s) =>
          s.country === 'US' &&
          typeof s.lat === 'number' &&
          typeof s.lng === 'number' &&
          s.label,
      )
      .sort((a, b) => a.rank - b.rank);

    // Dedupe by label (Photon often returns near-identical rows) and cap to 5.
    const seen = new Set<string>();
    const suggestions = mapped
      .filter((s) => {
        if (seen.has(s.label)) return false;
        seen.add(s.label);
        return true;
      })
      .slice(0, 5)
      // Drop the internal rank field from the response.
      .map(({ rank: _rank, ...s }) => s);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
