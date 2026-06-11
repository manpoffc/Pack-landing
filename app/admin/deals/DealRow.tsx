'use client';

import { useState } from 'react';
import type { DealRowData } from './page';

type Props = {
  deal: DealRowData;
  pullAction: (formData: FormData) => Promise<void>;
  restoreAction: (formData: FormData) => Promise<void>;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DealStatusBadge({ active, adminDisabled }: { active: boolean; adminDisabled: boolean }) {
  if (adminDisabled) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brick/20 text-brick">
        PULLED
      </span>
    );
  }
  if (active) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sage/30 text-espresso">
        Live
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sand text-espresso">
      Inactive
    </span>
  );
}

const VENDOR_STATUS_BADGE: Record<string, string> = {
  invited: 'bg-sand text-espresso',
  active: 'bg-sage/30 text-espresso',
  suspended: 'bg-tangerine/20 text-espresso',
  cancelled: 'bg-brick/20 text-brick',
};

export function DealRow({ deal, pullAction, restoreAction }: Props) {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState<null | 'pull' | 'restore'>(null);

  async function runAction(action: (fd: FormData) => Promise<void>) {
    const fd = new FormData();
    fd.set('item_id', deal.id);
    setPending(true);
    setActionError('');
    setConfirm(null);
    try {
      await action(fd);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={`bg-cream border rounded-2xl overflow-hidden shadow-sm p-5 ${
        deal.admin_disabled ? 'border-brick/40 opacity-80' : 'border-sand'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-display text-lg font-bold text-espresso">{deal.title}</h3>
          <p className="text-sm text-cocoa">{deal.vendor_business_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Vendor status */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              VENDOR_STATUS_BADGE[deal.vendor_status] ?? 'bg-sand text-espresso'
            }`}
          >
            vendor: {deal.vendor_status}
          </span>
          {/* Deal status */}
          <DealStatusBadge active={deal.active} adminDisabled={deal.admin_disabled} />
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
        <dt className="text-cocoa font-medium">Cost</dt>
        <dd className="text-espresso">{deal.cost_credits} credits</dd>
        <dt className="text-cocoa font-medium">Inventory remaining</dt>
        <dd className="text-espresso">
          {deal.inventory_remaining == null ? 'Unlimited' : deal.inventory_remaining}
        </dd>
        <dt className="text-cocoa font-medium">Created</dt>
        <dd className="text-espresso">{fmt(deal.created_at)}</dd>
      </dl>

      {/* Error */}
      {actionError && (
        <p className="text-sm text-brick font-medium mb-2">{actionError}</p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {!deal.admin_disabled ? (
          // Pull deal
          <>
            {confirm !== 'pull' ? (
              <button
                onClick={() => setConfirm('pull')}
                disabled={pending}
                className="bg-brick/10 text-brick text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brick/20 transition-colors disabled:opacity-50"
              >
                Pull deal
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-espresso">Pull this deal from the marketplace?</span>
                <button
                  onClick={() => runAction(pullAction)}
                  disabled={pending}
                  className="bg-brick text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Yes, pull it
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="text-sm text-cocoa underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          // Restore deal
          <>
            {confirm !== 'restore' ? (
              <button
                onClick={() => setConfirm('restore')}
                disabled={pending}
                className="bg-sage/20 text-espresso text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-sage/30 transition-colors disabled:opacity-50"
              >
                Restore deal
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-espresso">Restore this deal to the marketplace?</span>
                <button
                  onClick={() => runAction(restoreAction)}
                  disabled={pending}
                  className="bg-sage text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Yes, restore
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="text-sm text-cocoa underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
