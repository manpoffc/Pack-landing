'use client';

import { useRef, useState, useTransition } from 'react';
import { setVendorGeo } from './actions';

export default function ManualGeo() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await setVendorGeo(data);
      if (!result.ok) {
        setError(result.error);
      }
      // On success Next.js revalidatePath triggers a page refresh automatically.
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
      <p className="text-xs text-cocoa font-semibold uppercase tracking-wide">
        Enter coordinates manually
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-cocoa mb-1" htmlFor="lat">
            Latitude
          </label>
          <input
            id="lat"
            name="lat"
            type="text"
            placeholder="e.g. 40.7128"
            required
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-tangerine/40"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-cocoa mb-1" htmlFor="lng">
            Longitude
          </label>
          <input
            id="lng"
            name="lng"
            type="text"
            placeholder="e.g. -74.0060"
            required
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-tangerine/40"
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-brick font-medium">{error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start text-sm font-semibold text-white bg-tangerine rounded-full px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save location'}
      </button>
    </form>
  );
}
