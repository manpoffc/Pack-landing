'use client';

import { useState } from 'react';
import type { EventRow } from './page';

type Mode = 'pending' | 'approved';

type Props = {
  event: EventRow;
  mode: Mode;
  approveAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function EventCard({ event: ev, mode, approveAction, rejectAction, cancelAction }: Props) {
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [showCancelNote, setShowCancelNote] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');

  const mapsUrl =
    ev.lat != null && ev.lng != null
      ? `https://maps.google.com/?q=${ev.lat},${ev.lng}`
      : null;

  async function runAction(action: (fd: FormData) => Promise<void>, fd: FormData) {
    setPending(true);
    setActionError('');
    try {
      await action(fd);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-cream border border-sand rounded-2xl overflow-hidden shadow-sm">
      {/* banner */}
      {ev.banner_url && (
        <img
          src={ev.banner_url}
          alt={ev.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        {/* title + status badge */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display text-xl font-bold text-espresso">{ev.title}</h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              ev.status === 'pending'
                ? 'bg-sand text-espresso'
                : ev.status === 'approved'
                ? 'bg-sage/30 text-espresso'
                : 'bg-brick/20 text-brick'
            }`}
          >
            {ev.status}
          </span>
        </div>

        {/* description */}
        {ev.description && (
          <p className="text-sm text-cocoa mb-4 whitespace-pre-line">{ev.description}</p>
        )}

        {/* metadata grid */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
          {ev.venue_name && (
            <>
              <dt className="text-cocoa font-medium">Venue</dt>
              <dd className="text-espresso">
                {ev.venue_name}
                {mapsUrl && (
                  <>
                    {' '}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tangerine underline text-xs"
                    >
                      map
                    </a>
                  </>
                )}
              </dd>
            </>
          )}
          {ev.venue_address && (
            <>
              <dt className="text-cocoa font-medium">Address</dt>
              <dd className="text-espresso">{ev.venue_address}</dd>
            </>
          )}
          <dt className="text-cocoa font-medium">Starts</dt>
          <dd className="text-espresso">{fmt(ev.starts_at)}</dd>
          <dt className="text-cocoa font-medium">Ends</dt>
          <dd className="text-espresso">{fmt(ev.ends_at)}</dd>
          {ev.capacity != null && (
            <>
              <dt className="text-cocoa font-medium">Capacity</dt>
              <dd className="text-espresso">{ev.capacity}</dd>
            </>
          )}
          <dt className="text-cocoa font-medium">Created by</dt>
          <dd className="text-espresso font-mono text-xs truncate">{ev.created_by}</dd>
          <dt className="text-cocoa font-medium">Submitted</dt>
          <dd className="text-espresso">{fmt(ev.created_at)}</dd>
        </dl>

        {/* error */}
        {actionError && (
          <p className="text-sm text-brick font-medium mb-3">{actionError}</p>
        )}

        {/* actions */}
        {mode === 'pending' && (
          <div className="flex flex-wrap gap-3 mt-2">
            {/* Approve */}
            <form
              action={approveAction}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                runAction(approveAction, fd);
              }}
            >
              <input type="hidden" name="event_id" value={ev.id} />
              <button
                type="submit"
                disabled={pending}
                className="bg-sage text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Approve
              </button>
            </form>

            {/* Reject */}
            {!showRejectNote ? (
              <button
                onClick={() => setShowRejectNote(true)}
                className="bg-brick/10 text-brick text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-brick/20 transition-colors"
              >
                Reject…
              </button>
            ) : (
              <form
                className="w-full mt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.set('event_id', ev.id);
                  fd.set('note', rejectNote);
                  runAction(rejectAction, fd);
                }}
              >
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Rejection reason (optional)"
                  rows={3}
                  className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-brick resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="bg-brick text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Confirm reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectNote(false)}
                    className="text-sm text-cocoa underline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {mode === 'approved' && (
          <div className="flex flex-wrap gap-3 mt-2">
            {!showCancelNote ? (
              <button
                onClick={() => setShowCancelNote(true)}
                className="bg-brick/10 text-brick text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-brick/20 transition-colors"
              >
                Cancel event…
              </button>
            ) : (
              <form
                className="w-full mt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.set('event_id', ev.id);
                  fd.set('note', cancelNote);
                  runAction(cancelAction, fd);
                }}
              >
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Cancellation reason (optional)"
                  rows={3}
                  className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-brick resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="bg-brick text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Confirm cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelNote(false)}
                    className="text-sm text-cocoa underline"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
