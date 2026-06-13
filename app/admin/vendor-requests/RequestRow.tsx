'use client';

import { useState } from 'react';
import type { VendorRequestRowData } from './page';

type Props = {
  request: VendorRequestRowData;
  inviteAction: (formData: FormData) => Promise<void>;
  statusAction: (formData: FormData) => Promise<void>;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-tangerine/20 text-espresso',
  contacted: 'bg-sand text-espresso',
  invited: 'bg-sage/30 text-espresso',
  declined: 'bg-brick/20 text-brick',
};

export function RequestRow({ request: r, inviteAction, statusAction }: Props) {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmInvite, setConfirmInvite] = useState(false);

  const open = r.status === 'new' || r.status === 'contacted';

  async function runInvite() {
    setPending(true);
    setActionError('');
    setConfirmInvite(false);
    try {
      const fd = new FormData();
      fd.set('request_id', r.id);
      await inviteAction(fd);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setPending(false);
    }
  }

  async function runStatus(status: string) {
    setPending(true);
    setActionError('');
    try {
      const fd = new FormData();
      fd.set('request_id', r.id);
      fd.set('status', status);
      await statusAction(fd);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-cream border border-sand rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-display text-lg font-bold text-espresso">{r.business_name}</h3>
          <p className="text-sm text-cocoa">
            <a href={`mailto:${r.contact_email}`} className="hover:text-espresso underline">
              {r.contact_email}
            </a>
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            STATUS_BADGE[r.status] ?? 'bg-sand text-espresso'
          }`}
        >
          {r.status}
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
        {r.city && (
          <>
            <dt className="text-cocoa font-medium">City</dt>
            <dd className="text-espresso">{r.city}</dd>
          </>
        )}
        {r.website_url && (
          <>
            <dt className="text-cocoa font-medium">Website</dt>
            <dd>
              <a
                href={r.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tangerine underline text-xs break-all"
              >
                {r.website_url}
              </a>
            </dd>
          </>
        )}
        <dt className="text-cocoa font-medium">Requested</dt>
        <dd className="text-espresso">{fmt(r.created_at)}</dd>
      </dl>

      {r.what_they_sell && (
        <div className="mb-3 p-3 bg-parchment border border-sand rounded-lg">
          <p className="text-xs text-cocoa font-medium mb-1">What they'd offer</p>
          <p className="text-sm text-espresso whitespace-pre-wrap">{r.what_they_sell}</p>
        </div>
      )}

      {actionError && <p className="text-sm text-brick font-medium mb-2">{actionError}</p>}

      <div className="flex flex-wrap items-center gap-2 mt-2">
        {open && !confirmInvite && (
          <button
            onClick={() => setConfirmInvite(true)}
            disabled={pending}
            className="bg-tangerine text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Invite as vendor
          </button>
        )}
        {open && confirmInvite && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-espresso">
              Create the vendor + email an onboarding link?
            </span>
            <button
              onClick={runInvite}
              disabled={pending}
              className="bg-tangerine text-white text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pending ? 'Inviting…' : 'Yes, invite'}
            </button>
            <button onClick={() => setConfirmInvite(false)} className="text-sm text-cocoa underline">
              Cancel
            </button>
          </div>
        )}

        {r.status === 'new' && (
          <button
            onClick={() => runStatus('contacted')}
            disabled={pending}
            className="bg-sand/60 text-espresso text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-sand transition-colors disabled:opacity-50"
          >
            Mark contacted
          </button>
        )}

        {open && (
          <button
            onClick={() => runStatus('declined')}
            disabled={pending}
            className="bg-brick/10 text-brick text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brick/20 transition-colors disabled:opacity-50"
          >
            Decline
          </button>
        )}

        {!open && (
          <button
            onClick={() => runStatus('new')}
            disabled={pending}
            className="text-sm text-cocoa underline disabled:opacity-50"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
