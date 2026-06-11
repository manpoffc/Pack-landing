import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Free, no-key cities-by-state lookup via countriesnow.space, proxied so the
// browser doesn't deal with its POST→GET redirect or CORS. Used to populate
// the City dropdown once a State is chosen in vendor onboarding. The source
// mixes in county names ("Adams County"); we drop those so only places remain.

export async function GET(req: Request) {
  const state = new URL(req.url).searchParams.get('state')?.trim() ?? '';
  if (!state) return NextResponse.json({ cities: [] });

  try {
    const res = await fetch(
      `https://countriesnow.space/api/v0.1/countries/state/cities/q` +
        `?country=${encodeURIComponent('United States')}&state=${encodeURIComponent(state)}`,
      { headers: { 'User-Agent': 'PackVendorPortal/1.0 (hello@trypack.app)' } },
    );
    if (!res.ok) return NextResponse.json({ cities: [] });

    const data = (await res.json()) as { error?: boolean; data?: string[] };
    if (data.error || !Array.isArray(data.data)) {
      return NextResponse.json({ cities: [] });
    }

    const cities = Array.from(
      new Set(
        data.data
          .map((c) => c.trim())
          .filter((c) => c.length > 0 && !/\bcounty\b/i.test(c)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
