import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { RequestRow } from './RequestRow';
import { inviteFromRequest, markRequestStatus } from './actions';

export const metadata: Metadata = {
  title: 'Vendor Requests — Pack Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export type VendorRequestRowData = {
  id: string;
  business_name: string;
  contact_email: string;
  city: string | null;
  website_url: string | null;
  what_they_sell: string | null;
  status: 'new' | 'contacted' | 'invited' | 'declined';
  created_at: string;
};

// Returns ready:false (instead of throwing) when the m43 table doesn't exist
// yet, so the admin sees a "run the migration" notice rather than a 500.
async function fetchRequests(): Promise<{ ready: boolean; rows: VendorRequestRowData[] }> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('vendor_requests')
    .select('id, business_name, contact_email, city, website_url, what_they_sell, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || /does not exist/i.test(error.message)) {
      return { ready: false, rows: [] };
    }
    throw new Error(error.message);
  }
  return { ready: true, rows: (data ?? []) as VendorRequestRowData[] };
}

export default async function AdminVendorRequestsPage() {
  const { ready, rows } = await fetchRequests();

  const open = rows.filter((r) => r.status === 'new' || r.status === 'contacted');
  const handled = rows.filter((r) => r.status === 'invited' || r.status === 'declined');

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
          <span className="text-espresso font-semibold">Vendor Requests</span>
          <span className="text-sand">/</span>
          <a href="/admin/deals" className="text-cocoa hover:text-espresso underline">
            Deal Moderation
          </a>
        </nav>

        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso">Vendor Requests</h1>
            <p className="text-sm text-cocoa mt-1">
              {rows.length} total &middot; {open.length} open &middot;{' '}
              {handled.length} handled
            </p>
          </div>
          <a href="/api/admin/logout" className="text-sm text-cocoa hover:text-brick underline">
            Log out
          </a>
        </div>

        {!ready ? (
          <div className="bg-cream border border-sand rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-espresso mb-2">
              Migration not run yet
            </h2>
            <p className="text-sm text-cocoa">
              The <code className="text-espresso">vendor_requests</code> table doesn't exist yet.
              Run <code className="text-espresso">scripts/m43-vendor-requests.sql</code> in the
              Supabase SQL editor to enable this queue. Until then, requests still arrive by email.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-cocoa text-sm">
            No vendor requests yet. Submissions from{' '}
            <a href="/vendors" className="text-tangerine underline">
              trypack.app/vendors
            </a>{' '}
            will appear here.
          </p>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-xl font-bold text-espresso mb-4">
                Open ({open.length})
              </h2>
              {open.length === 0 ? (
                <p className="text-cocoa text-sm">Nothing waiting — all caught up. 🎉</p>
              ) : (
                <div className="space-y-4">
                  {open.map((r) => (
                    <RequestRow
                      key={r.id}
                      request={r}
                      inviteAction={inviteFromRequest}
                      statusAction={markRequestStatus}
                    />
                  ))}
                </div>
              )}
            </section>

            {handled.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-espresso mb-4">
                  Handled ({handled.length})
                </h2>
                <div className="space-y-4 opacity-80">
                  {handled.map((r) => (
                    <RequestRow
                      key={r.id}
                      request={r}
                      inviteAction={inviteFromRequest}
                      statusAction={markRequestStatus}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
