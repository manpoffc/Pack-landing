import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { DealRow } from './DealRow';
import { pullDeal, restoreDeal } from './actions';

export const metadata: Metadata = {
  title: 'Deal Moderation — Pack Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// ---------- types ----------

export type DealRowData = {
  id: string;
  title: string;
  cost_credits: number;
  inventory_remaining: number | null;
  active: boolean;
  admin_disabled: boolean;
  created_at: string;
  vendor_id: string;
  vendor_business_name: string;
  vendor_status: string;
};

// ---------- data fetching ----------

type MarketItemWithVendor = {
  id: string;
  title: string;
  cost_credits: number;
  inventory_remaining: number | null;
  active: boolean;
  admin_disabled: boolean;
  created_at: string;
  vendor_id: string;
  vendor: {
    business_name: string;
    status: string;
  } | null;
};

async function fetchDeals(): Promise<DealRowData[]> {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from('market_items')
    .select(
      'id, title, cost_credits, inventory_remaining, active, admin_disabled, created_at, vendor_id, vendor:vendors(business_name, status)',
    )
    .eq('kind', 'voucher')
    .not('vendor_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as MarketItemWithVendor[]).map((row) => ({
    id: row.id,
    title: row.title,
    cost_credits: row.cost_credits,
    inventory_remaining: row.inventory_remaining,
    active: row.active,
    admin_disabled: row.admin_disabled,
    created_at: row.created_at,
    vendor_id: row.vendor_id,
    vendor_business_name: row.vendor?.business_name ?? '(unknown vendor)',
    vendor_status: row.vendor?.status ?? 'unknown',
  }));
}

// ---------- page ----------

export default async function AdminDealsPage() {
  const deals = await fetchDeals();

  const pulled = deals.filter((d) => d.admin_disabled);
  const live = deals.filter((d) => !d.admin_disabled && d.active);
  const inactive = deals.filter((d) => !d.admin_disabled && !d.active);

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* admin nav */}
        <nav className="flex gap-4 mb-8 text-sm">
          <a href="/admin/events" className="text-cocoa hover:text-espresso underline">
            Event Review
          </a>
          <span className="text-sand">/</span>
          <a href="/admin/vendors" className="text-cocoa hover:text-espresso underline">
            Vendor Management
          </a>
          <span className="text-sand">/</span>
          <span className="text-espresso font-semibold">Deal Moderation</span>
        </nav>

        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso">
              Deal Moderation
            </h1>
            <p className="text-sm text-cocoa mt-1">
              {deals.length} total &middot;{' '}
              {live.length} live &middot;{' '}
              {inactive.length} inactive &middot;{' '}
              {pulled.length} pulled
            </p>
          </div>
          <a
            href="/api/admin/logout"
            className="text-sm text-cocoa hover:text-brick underline"
          >
            Log out
          </a>
        </div>

        {deals.length === 0 ? (
          <p className="text-cocoa text-sm">No vendor deals found.</p>
        ) : (
          <>
            {/* Live deals */}
            {live.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-xl font-bold text-espresso mb-4">
                  Live deals
                </h2>
                <div className="space-y-4">
                  {live.map((d) => (
                    <DealRow
                      key={d.id}
                      deal={d}
                      pullAction={pullDeal}
                      restoreAction={restoreDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Inactive deals */}
            {inactive.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-xl font-bold text-espresso mb-4">
                  Inactive deals
                </h2>
                <div className="space-y-4">
                  {inactive.map((d) => (
                    <DealRow
                      key={d.id}
                      deal={d}
                      pullAction={pullDeal}
                      restoreAction={restoreDeal}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pulled deals */}
            {pulled.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-xl font-bold text-espresso mb-4">
                  Pulled deals
                </h2>
                <div className="space-y-4">
                  {pulled.map((d) => (
                    <DealRow
                      key={d.id}
                      deal={d}
                      pullAction={pullDeal}
                      restoreAction={restoreDeal}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
