import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { VendorRow } from './VendorRow';
import {
  inviteVendor,
  suspendVendor,
  cancelVendor,
  reactivateVendor,
} from './actions';

export const metadata: Metadata = {
  title: 'Vendor Management — Pack Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// ---------- types ----------

export type VendorRowData = {
  id: string;
  business_name: string;
  contact_email: string;
  contact_name: string | null;
  status: 'invited' | 'active' | 'suspended' | 'cancelled';
  created_at: string;
  website_url: string | null;
  city: string | null;
  state: string | null;
};

type VendorInviteRow = {
  id: string;
  vendor_id: string;
  token: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
};

// ---------- data fetching ----------

async function fetchData(): Promise<{
  vendors: VendorRowData[];
  invites: VendorInviteRow[];
}> {
  const sb = supabaseAdmin();

  const [vendorsRes, invitesRes] = await Promise.all([
    sb
      .from('vendors')
      .select('id, business_name, contact_email, contact_name, status, created_at, website_url, city, state')
      .order('created_at', { ascending: false }),
    sb
      .from('vendor_invites')
      .select('id, vendor_id, token, email, expires_at, accepted_at')
      .is('accepted_at', null),
  ]);

  if (vendorsRes.error) throw new Error(vendorsRes.error.message);
  if (invitesRes.error) throw new Error(invitesRes.error.message);

  return {
    vendors: (vendorsRes.data ?? []) as VendorRowData[],
    invites: (invitesRes.data ?? []) as VendorInviteRow[],
  };
}

// ---------- page ----------

export default async function AdminVendorsPage() {
  const { vendors, invites } = await fetchData();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trypack.app';

  // Build a lookup: vendor_id → pending invite (not yet accepted)
  const inviteByVendor = new Map<string, VendorInviteRow>();
  for (const inv of invites) {
    inviteByVendor.set(inv.vendor_id, inv);
  }

  const counts = vendors.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* admin nav */}
        <nav className="flex gap-4 mb-8 text-sm">
          <a href="/admin/events" className="text-cocoa hover:text-espresso underline">
            Event Review
          </a>
          <span className="text-sand">/</span>
          <span className="text-espresso font-semibold">Vendor Management</span>
        </nav>

        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso">
              Vendor Management
            </h1>
            <p className="text-sm text-cocoa mt-1">
              {vendors.length} total &middot;{' '}
              {counts.active ?? 0} active &middot;{' '}
              {counts.invited ?? 0} invited &middot;{' '}
              {counts.suspended ?? 0} suspended
            </p>
          </div>
          <a
            href="/api/admin/logout"
            className="text-sm text-cocoa hover:text-brick underline"
          >
            Log out
          </a>
        </div>

        {/* Invite form */}
        <section className="mb-10 bg-cream border border-sand rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-espresso mb-4">
            Invite a vendor
          </h2>
          <form action={inviteVendor} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-cocoa mb-1" htmlFor="v-email">
                Contact email
              </label>
              <input
                id="v-email"
                name="email"
                type="email"
                required
                placeholder="vendor@example.com"
                className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-cocoa mb-1" htmlFor="v-biz">
                Business name
              </label>
              <input
                id="v-biz"
                name="business_name"
                type="text"
                required
                placeholder="Paw & Co."
                className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine"
              />
            </div>
            <button
              type="submit"
              className="bg-tangerine text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Send invite
            </button>
          </form>
          <p className="mt-3 text-xs text-cocoa">
            An invite link valid for 14 days will be emailed to the vendor. If delivery fails, the
            link will still appear below so you can share it manually.
          </p>
        </section>

        {/* Vendor list */}
        <section>
          <h2 className="font-display text-xl font-bold text-espresso mb-4">
            All vendors
          </h2>
          {vendors.length === 0 ? (
            <p className="text-cocoa text-sm">No vendors yet. Send your first invite above.</p>
          ) : (
            <div className="space-y-4">
              {vendors.map((v) => {
                const inv = inviteByVendor.get(v.id) ?? null;
                return (
                  <VendorRow
                    key={v.id}
                    vendor={v}
                    suspendAction={suspendVendor}
                    cancelAction={cancelVendor}
                    reactivateAction={reactivateVendor}
                    siteUrl={siteUrl}
                    inviteToken={inv?.token ?? null}
                    inviteExpiry={inv?.expires_at ?? null}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
