'use client';

import { useState } from 'react';
import DealForm from './DealForm';
import AddCodesModal from './AddCodesModal';
import { toggleDeal } from './actions';

export type DealStats = {
  codes_total: number;
  codes_claimed: number;
  redemptions: number;
};

export type DealRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cost_credits: number;
  inventory_remaining: number | null;
  active: boolean;
  admin_disabled: boolean;
  created_at: string;
  stats: DealStats | null;
};

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; deal: DealRow }
  | { kind: 'add-codes'; deal: DealRow }
  | null;

type Props = {
  initialDeals: DealRow[];
};

function StatusBadge({ deal }: { deal: DealRow }) {
  if (deal.admin_disabled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brick/15 text-brick rounded-full px-2.5 py-0.5">
        Pulled by Pack
      </span>
    );
  }
  if (deal.active) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-sage/30 text-espresso rounded-full px-2.5 py-0.5">
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-sand text-cocoa rounded-full px-2.5 py-0.5">
      Inactive
    </span>
  );
}

function DealCard({
  deal,
  onEdit,
  onAddCodes,
  onToggle,
}: {
  deal: DealRow;
  onEdit: () => void;
  onAddCodes: () => void;
  onToggle: () => void;
}) {
  const stats = deal.stats;
  const codesLeft = stats ? stats.codes_total - stats.codes_claimed : null;
  const outOfCodes = deal.active && stats !== null && codesLeft === 0;

  return (
    <div className="bg-cream border border-sand rounded-2xl overflow-hidden shadow-sm">
      <div className="flex gap-4 p-5">
        {/* Image */}
        <div className="shrink-0">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={deal.image_url}
              alt={deal.title}
              className="h-20 w-20 rounded-xl object-cover border border-sand bg-parchment"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-parchment border border-sand flex items-center justify-center text-3xl">
              🏷️
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-espresso text-base leading-tight">
              {deal.title}
            </h3>
            <StatusBadge deal={deal} />
          </div>

          {deal.description && (
            <p className="text-sm text-cocoa leading-snug mb-2 line-clamp-2">
              {deal.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cocoa mb-2">
            <span>
              <span className="font-semibold text-espresso">{deal.cost_credits}</span> credits
            </span>
            <span>
              {deal.inventory_remaining != null
                ? `${deal.inventory_remaining} left`
                : 'Unlimited qty'}
            </span>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-cocoa">
              <span>
                Codes:{' '}
                <span className="font-semibold text-espresso">
                  {stats.codes_claimed}/{stats.codes_total}
                </span>{' '}
                claimed
              </span>
              <span>
                Redemptions:{' '}
                <span className="font-semibold text-espresso">{stats.redemptions}</span>
              </span>
            </div>
          )}

          {/* Admin-disabled explanation */}
          {deal.admin_disabled && (
            <p className="mt-2 text-xs text-brick bg-brick/10 rounded-lg px-2.5 py-1.5">
              This deal has been hidden by Pack. Contact{' '}
              <a href="mailto:hello@trypack.app" className="underline">
                hello@trypack.app
              </a>{' '}
              if you have questions.
            </p>
          )}

          {/* Out of codes warning */}
          {outOfCodes && (
            <p className="mt-2 text-xs text-tangerine bg-tangerine/10 rounded-lg px-2.5 py-1.5 font-medium">
              No codes left — add more codes or customers cannot redeem this deal.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-4">
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-espresso border border-sand bg-parchment px-3 py-1.5 rounded-lg hover:bg-sand/40 transition-colors"
        >
          Edit
        </button>
        {!deal.admin_disabled && (
          <button
            onClick={onToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              deal.active
                ? 'bg-sand text-espresso hover:bg-sand/70'
                : 'bg-sage/20 text-espresso hover:bg-sage/30'
            }`}
          >
            {deal.active ? 'Deactivate' : 'Activate'}
          </button>
        )}
        <button
          onClick={onAddCodes}
          className="text-xs font-semibold text-tangerine border border-tangerine/30 px-3 py-1.5 rounded-lg hover:bg-tangerine/10 transition-colors"
        >
          Add codes
        </button>
      </div>
    </div>
  );
}

export default function DealsManager({ initialDeals }: Props) {
  const [modal, setModal] = useState<Modal>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string>('');

  // Header with "Add a deal" button — owned by client component so it can open
  // the create modal directly.
  const headerActions = (
    <div className="flex justify-end mb-6">
      <button
        onClick={() => setModal({ kind: 'create' })}
        className="bg-tangerine text-white font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        + Add a deal
      </button>
    </div>
  );

  async function handleToggle(deal: DealRow) {
    setTogglingId(deal.id);
    setToggleError('');

    const fd = new FormData();
    fd.set('item_id', deal.id);
    fd.set('title', deal.title);
    fd.set('description', deal.description ?? '');
    fd.set('existing_image_url', deal.image_url ?? '');
    fd.set('cost_credits', String(deal.cost_credits));
    fd.set('inventory_remaining', deal.inventory_remaining != null ? String(deal.inventory_remaining) : '');
    fd.set('new_active', String(!deal.active));

    const result = await toggleDeal(fd);
    setTogglingId(null);

    if (!result.ok) {
      setToggleError(result.error);
    }
  }

  return (
    <div>
      {/* Header row with "Add a deal" button */}
      {headerActions}

      {/* Toggle error (global, since it's a quick action) */}
      {toggleError && (
        <p className="mb-4 text-sm text-brick font-medium" role="alert">
          {toggleError}
        </p>
      )}

      {/* Deals list */}
      {initialDeals.length === 0 && !modal ? (
        <div className="text-center py-16 text-cocoa">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-display font-bold text-espresso text-lg mb-1">
            No deals yet
          </p>
          <p className="text-sm mb-5">
            Create your first deal to start offering exclusive discounts to Pack dog walkers.
          </p>
          <button
            onClick={() => setModal({ kind: 'create' })}
            className="bg-tangerine text-white font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Create a deal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {initialDeals.map((deal) => (
            <div key={deal.id} className={togglingId === deal.id ? 'opacity-60 pointer-events-none' : ''}>
              <DealCard
                deal={deal}
                onEdit={() => setModal({ kind: 'edit', deal })}
                onAddCodes={() => setModal({ kind: 'add-codes', deal })}
                onToggle={() => handleToggle(deal)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal overlay */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/40 px-4 pb-4 sm:pb-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="bg-cream border border-sand rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            {modal.kind === 'create' && (
              <>
                <h2 className="font-display text-xl font-bold text-espresso mb-5">
                  New deal
                </h2>
                <DealForm onClose={() => setModal(null)} />
              </>
            )}
            {modal.kind === 'edit' && (
              <>
                <h2 className="font-display text-xl font-bold text-espresso mb-5">
                  Edit deal
                </h2>
                <DealForm deal={modal.deal} onClose={() => setModal(null)} />
              </>
            )}
            {modal.kind === 'add-codes' && (
              <>
                <h2 className="font-display text-xl font-bold text-espresso mb-5">
                  Add redemption codes
                </h2>
                <AddCodesModal
                  itemId={modal.deal.id}
                  dealTitle={modal.deal.title}
                  onClose={() => setModal(null)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
