import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Address autocomplete proxied through Photon (photon.komoot.io) — a free,
// no-API-key, OSM-based geocoder built for type-ahead. Proxying keeps the
// descriptive User-Agent server-side (OSM etiquette) and avoids any browser
// CORS/policy concerns. Returns structured parts + coordinates so the vendor
// is geocoded at onboarding (no later Nominatim step needed).

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | undefined>;
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 3) return NextResponse.json({ suggestions: [] });

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`,
      { headers: { 'User-Agent': 'PackVendorPortal/1.0 (hello@trypack.app)' } },
    );
    if (!res.ok) return NextResponse.json({ suggestions: [] });

    const data = (await res.json()) as { features?: PhotonFeature[] };
    const suggestions = (data.features ?? [])
      .map((f) => {
        const p = f.properties ?? {};
        const [lng, lat] = f.geometry?.coordinates ?? [undefined, undefined];
        const line1 = [p.housenumber, p.street ?? p.name].filter(Boolean).join(' ').trim();
        const city = p.city ?? p.town ?? p.village ?? p.locality ?? '';
        const country = (p.countrycode ?? '').toUpperCase();
        const label = [line1 || p.name, city, p.state, p.postcode, country]
          .filter(Boolean)
          .join(', ');
        return {
          label,
          line1: line1 || p.name || '',
          city,
          state: p.state ?? '',
          postal: p.postcode ?? '',
          country,
          lat,
          lng,
        };
      })
      .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number' && s.label);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
