import type { Metadata } from 'next';
import Link from 'next/link';
import { requireActiveVendor } from '@/lib/vendorSession';
import { vendorServerClient } from '@/lib/supabaseVendor';
import DealsManager, { type DealRow, type DealStats } from './DealsManager';

export const metadata: Metadata = {
  title: 'Your Deals — Pack Vendor Portal',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// RPC return shape from vendor_list_deals()
type RawDeal = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cost_credits: number;
  inventory_remaining: number | null;
  active: boolean;
  admin_disabled: boolean;
  created_at: string;
};

// RPC return shape from vendor_deal_stats()
type RawStats = {
  codes_total: number;
  codes_claimed: number;
  redemptions: number;
};

async function fetchDeals(): Promise<DealRow[]> {
  const supabase = vendorServerClient();

  const { data: deals, error: dealsError } = await supabase.rpc('vendor_list_deals');
  if (dealsError) throw new Error(dealsError.message);

  const rawDeals = (deals ?? []) as RawDeal[];
  if (rawDeals.length === 0) return [];

  // Fetch stats for all deals in parallel
  const statsResults = await Promise.all(
    rawDeals.map((deal) =>
      supabase
        .rpc('vendor_deal_stats', { p_item_id: deal.id })
        .then(({ data, error }) => {
          if (error) return null;
          // vendor_deal_stats returns a single row (or empty array)
          const row = Array.isArray(data)
            ? (data[0] as RawStats | undefined)
            : (data as RawStats | null);
          return row ?? null;
        }),
    ),
  );

  return rawDeals.map((deal, i): DealRow => {
    const rawStats = statsResults[i] as RawStats | null;
    const stats: DealStats | null = rawStats
      ? {
          codes_total: rawStats.codes_total ?? 0,
          codes_claimed: rawStats.codes_claimed ?? 0,
          redemptions: rawStats.redemptions ?? 0,
        }
      : null;
    return { ...deal, stats };
  });
}

export default async function VendorDealsPage() {
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

  let deals: DealRow[] = [];
  let fetchError: string | null = null;

  try {
    deals = await fetchDeals();
  } catch (e) {
    fetchError = e instanceof Error ? e.message : 'Failed to load deals';
  }

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
            Dashboard
          </Link>
          <span className="text-sand">/</span>
          <span className="text-espresso font-semibold">Your deals</span>
        </nav>

        {/* Header + DealsManager (client component owns "Add a deal" button + modals) */}
        <div className="mb-2">
          <h1 className="font-display text-3xl font-bold text-espresso">Your deals</h1>
          <p className="text-sm text-cocoa mt-1">
            {deals.length === 0
              ? 'No deals yet'
              : `${deals.length} deal${deals.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {fetchError ? (
          <div className="bg-brick/10 border border-brick/30 rounded-xl p-4 text-sm text-brick">
            <p className="font-semibold mb-1">Could not load deals</p>
            <p>{fetchError}</p>
          </div>
        ) : (
          <DealsManager initialDeals={deals} />
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
