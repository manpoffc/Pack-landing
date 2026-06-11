'use client';

import { useState } from 'react';
import type { VendorRowData } from './page';

type Props = {
  vendor: VendorRowData;
  suspendAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
  reactivateAction: (formData: FormData) => Promise<void>;
  siteUrl: string;
  inviteToken: string | null;
  inviteExpiry: string | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_BADGE: Record<string, string> = {
  invited: 'bg-sand text-espresso',
  active: 'bg-sage/30 text-espresso',
  suspended: 'bg-tangerine/20 text-espresso',
  cancelled: 'bg-brick/20 text-brick',
};

export function VendorRow({
  vendor: v,
  suspendAction,
  cancelAction,
  reactivateAction,
  siteUrl,
  inviteToken,
  inviteExpiry,
}: Props) {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState<null | 'suspend' | 'cancel' | 'reactivate'>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = inviteToken
    ? `${siteUrl}/vendor/onboard?token=${inviteToken}`
    : null;

  async function runAction(action: (fd: FormData) => Promise<void>) {
    const fd = new FormData();
    fd.set('vendor_id', v.id);
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

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-cream border border-sand rounded-2xl overflow-hidden shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-display text-lg font-bold text-espresso">{v.business_name}</h3>
          {v.contact_name && (
            <p className="text-sm text-cocoa">{v.contact_name}</p>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            STATUS_BADGE[v.status] ?? 'bg-sand text-espresso'
          }`}
        >
          {v.status}
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
        <dt className="text-cocoa font-medium">Email</dt>
        <dd className="text-espresso">{v.contact_email}</dd>
        {(v.city || v.state) && (
          <>
            <dt className="text-cocoa font-medium">Location</dt>
            <dd className="text-espresso">
              {[v.city, v.state].filter(Boolean).join(', ')}
            </dd>
          </>
        )}
        {v.website_url && (
          <>
            <dt className="text-cocoa font-medium">Website</dt>
            <dd>
              <a
                href={v.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tangerine underline text-xs"
              >
                {v.website_url}
              </a>
            </dd>
          </>
        )}
        <dt className="text-cocoa font-medium">Invited</dt>
        <dd className="text-espresso">{fmt(v.created_at)}</dd>
        {inviteExpiry && (
          <>
            <dt className="text-cocoa font-medium">Invite expires</dt>
            <dd className="text-espresso">{fmt(inviteExpiry)}</dd>
          </>
        )}
      </dl>

      {/* Invite link (shown for invited vendors) */}
      {inviteLink && (
        <div className="mb-3 p-3 bg-parchment border border-sand rounded-lg">
          <p className="text-xs text-cocoa font-medium mb-1">Onboarding link</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-espresso break-all flex-1">{inviteLink}</code>
            <button
              onClick={copyLink}
              className="shrink-0 text-xs font-semibold text-tangerine hover:opacity-80 transition-opacity"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {actionError && (
        <p className="text-sm text-brick font-medium mb-2">{actionError}</p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Suspend: available for active vendors */}
        {v.status === 'active' && (
          <>
            {confirm !== 'suspend' ? (
              <button
                onClick={() => setConfirm('suspend')}
                disabled={pending}
                className="bg-tangerine/10 text-espresso text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-tangerine/20 transition-colors disabled:opacity-50"
              >
                Suspend
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-espresso">Suspend this vendor?</span>
                <button
                  onClick={() => runAction(suspendAction)}
                  disabled={pending}
                  className="bg-tangerine text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Yes, suspend
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

        {/* Cancel: available for active or invited vendors */}
        {(v.status === 'active' || v.status === 'invited') && (
          <>
            {confirm !== 'cancel' ? (
              <button
                onClick={() => setConfirm('cancel')}
                disabled={pending}
                className="bg-brick/10 text-brick text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brick/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-espresso">Cancel this vendor?</span>
                <button
                  onClick={() => runAction(cancelAction)}
                  disabled={pending}
                  className="bg-brick text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Yes, cancel
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="text-sm text-cocoa underline"
                >
                  Back
                </button>
              </div>
            )}
          </>
        )}

        {/* Reactivate: available for suspended or cancelled vendors */}
        {(v.status === 'suspended' || v.status === 'cancelled') && (
          <>
            {confirm !== 'reactivate' ? (
              <button
                onClick={() => setConfirm('reactivate')}
                disabled={pending}
                className="bg-sage/20 text-espresso text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-sage/30 transition-colors disabled:opacity-50"
              >
                Reactivate
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-espresso">Reactivate this vendor?</span>
                <button
                  onClick={() => runAction(reactivateAction)}
                  disabled={pending}
                  className="bg-sage text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Yes, reactivate
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="text-sm text-cocoa underline"
                >
                  Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
