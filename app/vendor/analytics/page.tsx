import type { Metadata } from 'next';
import Link from 'next/link';
import { requireActiveVendor } from '@/lib/vendorSession';
import { vendorServerClient } from '@/lib/supabaseVendor';
import DailyBars from './DailyBars';

export const metadata: Metadata = {
  title: 'Analytics — Pack Vendor Portal',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// RPC return shapes
type OverviewRow = {
  deal_id: string;
  title: string;
  active: boolean;
  admin_disabled: boolean;
  cost_credits: number;
  codes_total: number;
  codes_remaining: number;
  redemptions: number;
  credits_spent: number;
};

type DailyRow = {
  day: string;
  redemptions: number;
};

function StatusBadge({ active, adminDisabled }: { active: boolean; adminDisabled: boolean }) {
  if (adminDisabled) {
    return (
      <span className="text-xs font-semibold text-white bg-brick rounded-full px-2.5 py-1">
        Pulled by Pack
      </span>
    );
  }
  if (active) {
    return (
      <span className="text-xs font-semibold text-white bg-sage rounded-full px-2.5 py-1">
        Live
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold text-cocoa bg-sand rounded-full px-2.5 py-1">
      Inactive
    </span>
  );
}

export default async function VendorAnalyticsPage() {
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

  const supabase = vendorServerClient();

  // Fetch overview analytics for all of this vendor's deals
  const { data: overviewData, error: overviewError } =
    await supabase.rpc('vendor_overview_analytics');

  if (overviewError) {
    return (
      <main className="bg-parchment min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
              Dashboard
            </Link>
            <span className="text-sand">/</span>
            <span className="text-espresso font-semibold">Analytics</span>
          </nav>
          <div className="bg-brick/10 border border-brick/30 rounded-xl p-4 text-sm text-brick">
            <p className="font-semibold mb-1">Could not load analytics</p>
            <p>{overviewError.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const deals = (overviewData ?? []) as OverviewRow[];

  // Empty state
  if (deals.length === 0) {
    return (
      <main className="bg-parchment min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
              Dashboard
            </Link>
            <span className="text-sand">/</span>
            <span className="text-espresso font-semibold">Analytics</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-espresso mb-4">Analytics</h1>
          <div className="bg-cream border border-sand rounded-2xl p-10 text-center">
            <p className="text-2xl mb-3">📊</p>
            <p className="font-display font-bold text-espresso text-lg mb-1">No deals yet</p>
            <p className="text-sm text-cocoa mb-5">
              Create a deal to start seeing foot traffic and redemption data.
            </p>
            <Link
              href="/vendor/deals"
              className="inline-block text-sm font-semibold text-white bg-tangerine rounded-full px-5 py-2 hover:opacity-90 transition-opacity"
            >
              Go to Deals &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch 30-day daily breakdown for every deal in parallel
  const dailyResults = await Promise.all(
    deals.map((deal) =>
      supabase
        .rpc('vendor_deal_daily', { p_item_id: deal.deal_id, p_days: 30 })
        .then(({ data, error }) => {
          if (error) return [] as DailyRow[];
          return (data ?? []) as DailyRow[];
        }),
    ),
  );

  // Top-level summary metrics
  const totalRedemptions = deals.reduce((sum, d) => sum + (d.redemptions ?? 0), 0);
  const liveDeals = deals.filter((d) => d.active && !d.admin_disabled).length;
  const totalCreditsSpent = deals.reduce((sum, d) => sum + (Number(d.credits_spent) || 0), 0);

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/vendor" className="text-cocoa hover:text-espresso underline">
            Dashboard
          </Link>
          <span className="text-sand">/</span>
          <span className="text-espresso font-semibold">Analytics</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-espresso mb-8">Analytics</h1>

        {/* Top summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Total redemptions — lead metric */}
          <div className="bg-cream border border-sand rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-xs text-cocoa font-medium uppercase tracking-wide">
              Total Redemptions
            </p>
            <p className="font-display text-4xl font-bold text-espresso leading-none">
              {totalRedemptions.toLocaleString()}
            </p>
            <p className="text-xs text-cocoa mt-1">Walkers who visited your deal</p>
          </div>

          {/* Live deals */}
          <div className="bg-cream border border-sand rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-xs text-cocoa font-medium uppercase tracking-wide">Live Deals</p>
            <p className="font-display text-4xl font-bold text-espresso leading-none">
              {liveDeals}
            </p>
            <p className="text-xs text-cocoa mt-1">
              of {deals.length} deal{deals.length === 1 ? '' : 's'} active
            </p>
          </div>

          {/* Credits spent — labeled clearly as engagement, not revenue */}
          <div className="bg-cream border border-sand rounded-2xl p-5 flex flex-col gap-1">
            <p className="text-xs text-cocoa font-medium uppercase tracking-wide">
              Customer Credits Spent
            </p>
            <p className="font-display text-4xl font-bold text-espresso leading-none">
              {totalCreditsSpent.toLocaleString()}
            </p>
            <p className="text-xs text-cocoa mt-1">Credits your customers spent (goes to Pack)</p>
          </div>
        </section>

        {/* Per-deal cards */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-xl font-bold text-espresso">Per-Deal Breakdown</h2>

          {deals.map((deal, i) => {
            const dailyRows = dailyResults[i] ?? [];
            const codesOut = deal.codes_total - deal.codes_remaining;
            const isSoldOut = deal.active && !deal.admin_disabled && deal.codes_remaining === 0;

            return (
              <div
                key={deal.deal_id}
                className="bg-cream border border-sand rounded-2xl p-6 flex flex-col gap-4"
              >
                {/* Deal header */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-espresso text-lg leading-snug">
                    {deal.title}
                  </h3>
                  <StatusBadge active={deal.active} adminDisabled={deal.admin_disabled} />
                </div>

                {/* Key metrics row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Redemptions — primary metric */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-cocoa font-medium">Redemptions</p>
                    <p className="font-display text-3xl font-bold text-espresso leading-none">
                      {(deal.redemptions ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-cocoa">walkers visited</p>
                  </div>

                  {/* Codes */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-cocoa font-medium">Codes</p>
                    <p
                      className={`font-display text-3xl font-bold leading-none ${
                        isSoldOut ? 'text-brick' : 'text-espresso'
                      }`}
                    >
                      {deal.codes_remaining.toLocaleString()}
                    </p>
                    <p className={`text-xs ${isSoldOut ? 'text-brick font-semibold' : 'text-cocoa'}`}>
                      {isSoldOut
                        ? 'Sold out — no codes left'
                        : `of ${deal.codes_total.toLocaleString()} remaining`}
                    </p>
                  </div>

                  {/* Credits spent — secondary, clearly labeled */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-cocoa font-medium">Credits Spent</p>
                    <p className="font-display text-3xl font-bold text-espresso leading-none">
                      {Number(deal.credits_spent ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-cocoa">by your customers (→ Pack)</p>
                  </div>
                </div>

                {/* 30-day bar chart */}
                <div>
                  <p className="text-xs text-cocoa font-medium mb-2">Last 30 days — redemptions</p>
                  <DailyBars rows={dailyRows} />
                </div>
              </div>
            );
          })}
        </section>

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
