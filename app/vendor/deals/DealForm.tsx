'use client';

import { useState, useRef, ChangeEvent } from 'react';
import type { DealRow } from './DealsManager';
import { createDeal, updateDeal } from './actions';

type Props = {
  deal?: DealRow; // present when editing
  onClose: () => void;
};

function inputClass(extra?: string) {
  return `w-full border border-sand rounded-lg px-3 py-2 text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine text-sm ${extra ?? ''}`;
}

function labelClass() {
  return 'block text-xs font-semibold text-cocoa mb-1';
}

export default function DealForm({ deal, onClose }: Props) {
  const isEdit = !!deal;

  const [title, setTitle] = useState(deal?.title ?? '');
  const [description, setDescription] = useState(deal?.description ?? '');
  const [costCredits, setCostCredits] = useState(
    deal?.cost_credits != null ? String(deal.cost_credits) : '',
  );
  const [inventory, setInventory] = useState(
    deal?.inventory_remaining != null ? String(deal.inventory_remaining) : '',
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    deal?.image_url ?? null,
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string>('');

  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    title.trim().length > 0 &&
    parseInt(costCredits, 10) > 0 &&
    !pending;

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setPending(true);

    const fd = new FormData();
    fd.set('title', title.trim());
    fd.set('description', description.trim());
    fd.set('cost_credits', costCredits);
    fd.set('inventory_remaining', inventory);
    fd.set('image_filename', imageFilename);
    if (imageBase64) {
      fd.set('image_base64', imageBase64);
    }

    let result;
    if (isEdit) {
      fd.set('item_id', deal.id);
      fd.set('existing_image_url', deal.image_url ?? '');
      fd.set('active', String(deal.active));
      result = await updateDeal(fd);
    } else {
      result = await createDeal(fd);
    }

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Title */}
      <div>
        <label htmlFor="deal-title" className={labelClass()}>
          Title <span className="text-brick">*</span>
        </label>
        <input
          id="deal-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className={inputClass()}
          placeholder="e.g. 10% off any order"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="deal-desc" className={labelClass()}>
          Description
        </label>
        <textarea
          id="deal-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className={inputClass('resize-none')}
          placeholder="Any details dog parents should know about this deal"
        />
      </div>

      {/* Cost + Inventory */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deal-cost" className={labelClass()}>
            Cost (credits) <span className="text-brick">*</span>
          </label>
          <input
            id="deal-cost"
            type="number"
            min={1}
            step={1}
            value={costCredits}
            onChange={(e) => setCostCredits(e.target.value)}
            required
            className={inputClass()}
            placeholder="e.g. 50"
          />
        </div>
        <div>
          <label htmlFor="deal-inv" className={labelClass()}>
            Quantity (optional)
          </label>
          <input
            id="deal-inv"
            type="number"
            min={1}
            step={1}
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            className={inputClass()}
            placeholder="Leave blank = unlimited"
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <label className={labelClass()}>Deal image (optional)</label>
        {imagePreview && (
          <div className="mb-2 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Deal image preview"
              className="h-24 w-24 object-cover rounded-xl border border-sand bg-parchment"
            />
          </div>
        )}
        <input
          id="deal-image"
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleImageChange}
          className="w-full text-sm text-cocoa file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-tangerine file:text-white hover:file:opacity-90 cursor-pointer"
        />
        {isEdit && deal.image_url && !imageBase64 && (
          <p className="text-xs text-cocoa mt-1">Current image will be kept unless you choose a new one.</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-brick font-medium" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 bg-tangerine text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm"
        >
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
            ? 'Save changes'
            : 'Create deal'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="px-4 py-2 text-sm text-cocoa border border-sand rounded-lg hover:bg-sand/30 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
