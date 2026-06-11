/**
 * Geocode a postal address using the OSM Nominatim API.
 *
 * Returns { lat, lng } on success, null if the address cannot be located or
 * any network/parse error occurs.
 *
 * Note: Nominatim returns `lon` (not `lng`) in its JSON response.
 */

interface AddressParts {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal?: string | null;
  country?: string | null;
}

interface GeoResult {
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

export async function geocodeAddress(parts: AddressParts): Promise<GeoResult | null> {
  try {
    const segments = [
      parts.line1,
      parts.line2,
      parts.city,
      parts.state,
      parts.postal,
      parts.country,
    ].filter((s): s is string => typeof s === 'string' && s.trim().length > 0);

    if (segments.length === 0) return null;

    const q = segments.join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PackVendorPortal/1.0 (hello@trypack.app)',
      },
    });

    if (!res.ok) return null;

    const data: NominatimResult[] = await res.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
