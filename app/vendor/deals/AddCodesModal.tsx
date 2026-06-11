'use client';

import { useState } from 'react';
import { addCodes } from './actions';

type Props = {
  itemId: string;
  dealTitle: string;
  onClose: () => void;
};

function labelClass() {
  return 'block text-xs font-semibold text-cocoa mb-1';
}

export default function AddCodesModal({ itemId, dealTitle, onClose }: Props) {
  const [codes, setCodes] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canSubmit = codes.trim().length > 0 && !pending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setSuccessMsg('');
    setPending(true);

    const fd = new FormData();
    fd.set('item_id', itemId);
    fd.set('codes', codes);

    const result = await addCodes(fd);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccessMsg(result.message ?? 'Codes added.');
    setCodes('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-cocoa mb-3">
          Adding codes for: <span className="font-semibold text-espresso">{dealTitle}</span>
        </p>
        <label htmlFor="codes-textarea" className={labelClass()}>
          Codes <span className="text-brick">*</span>
        </label>
        <textarea
          id="codes-textarea"
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
          rows={8}
          className="w-full border border-sand rounded-lg px-3 py-2 text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine text-sm font-mono resize-none"
          placeholder={"CODE123\nCODE456\nCODE789"}
        />
        <p className="text-xs text-cocoa mt-1">
          One code per line, or separate with commas. Duplicates are ignored.
        </p>
      </div>

      {error && (
        <p className="text-sm text-brick font-medium" role="alert">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-sage font-medium" role="status">
          {successMsg}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 bg-tangerine text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm"
        >
          {pending ? 'Adding…' : 'Add codes'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="px-4 py-2 text-sm text-cocoa border border-sand rounded-lg hover:bg-sand/30 transition-colors disabled:opacity-50"
        >
          Close
        </button>
      </div>
    </form>
  );
}
