'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getVendor } from '@/lib/vendorSession';
import { vendorServerClient } from '@/lib/supabaseVendor';

// Defense-in-depth: every action re-validates the active vendor session.
async function requireVendor() {
  const result = await getVendor();
  if (result.kind === 'no_session') redirect('/vendor/login');
  if (result.kind === 'not_a_vendor') throw new Error('Not a vendor');
  if (result.vendor.status !== 'active') throw new Error('Vendor account is not active');
  return result.vendor;
}

// redirect() works by throwing a NEXT_REDIRECT error; an action's catch must
// re-throw it (not swallow it into an error string) or the navigation is lost.
function isRedirectError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'digest' in e &&
    typeof (e as { digest?: unknown }).digest === 'string' &&
    (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

// Upload a base64 data-URL image to the deal-images bucket.
// Returns the public URL, or null if no image was provided.
async function uploadDealImage(
  supabase: ReturnType<typeof vendorServerClient>,
  base64DataUrl: string | null,
  filename: string | null,
): Promise<string | null> {
  if (!base64DataUrl) return null;

  // Strip the data:image/...;base64, prefix
  const match = base64DataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64Data = match[2];

  // Cap at ~3MB of base64 (~2.2MB decoded) to avoid OOM / bucket bloat.
  if (base64Data.length > 3_000_000) {
    throw new Error('Image is too large — please use one under ~2MB.');
  }

  // Derive extension from mime type (fallback to jpg)
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Decode base64 to binary
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from('deal-images')
    .upload(path, bytes, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('deal-images')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function createDeal(formData: FormData): Promise<ActionResult> {
  try {
    await requireVendor();

    const title = (formData.get('title') as string | null)?.trim() ?? '';
    const description = (formData.get('description') as string | null)?.trim() ?? '';
    const imageBase64 = (formData.get('image_base64') as string | null) ?? null;
    const imageFilename = (formData.get('image_filename') as string | null) ?? null;
    const costStr = formData.get('cost_credits') as string | null;
    const inventoryStr = formData.get('inventory_remaining') as string | null;

    if (!title) return { ok: false, error: 'Title is required.' };
    const cost = parseInt(costStr ?? '', 10);
    if (isNaN(cost) || cost <= 0) return { ok: false, error: 'Cost must be a positive number of credits.' };
    const inventory = inventoryStr ? parseInt(inventoryStr, 10) : null;
    if (inventoryStr && (isNaN(inventory!) || inventory! <= 0)) {
      return { ok: false, error: 'Inventory must be a positive number if provided.' };
    }

    const supabase = vendorServerClient();
    const imageUrl = await uploadDealImage(supabase, imageBase64, imageFilename);

    const { error } = await supabase.rpc('vendor_create_deal', {
      p_title: title,
      p_description: description || null,
      p_image_url: imageUrl,
      p_cost_credits: cost,
      p_inventory_remaining: inventory,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/vendor/deals');
    return { ok: true };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}

export async function updateDeal(formData: FormData): Promise<ActionResult> {
  try {
    await requireVendor();

    const itemId = (formData.get('item_id') as string | null)?.trim() ?? '';
    const title = (formData.get('title') as string | null)?.trim() ?? '';
    const description = (formData.get('description') as string | null)?.trim() ?? '';
    const imageBase64 = (formData.get('image_base64') as string | null) ?? null;
    const existingImageUrl = (formData.get('existing_image_url') as string | null) ?? null;
    const imageFilename = (formData.get('image_filename') as string | null) ?? null;
    const costStr = formData.get('cost_credits') as string | null;
    const inventoryStr = formData.get('inventory_remaining') as string | null;
    const activeStr = formData.get('active') as string | null;

    if (!itemId) return { ok: false, error: 'Missing deal ID.' };
    if (!title) return { ok: false, error: 'Title is required.' };
    const cost = parseInt(costStr ?? '', 10);
    if (isNaN(cost) || cost <= 0) return { ok: false, error: 'Cost must be a positive number of credits.' };
    const inventory = inventoryStr ? parseInt(inventoryStr, 10) : null;
    if (inventoryStr && (isNaN(inventory!) || inventory! <= 0)) {
      return { ok: false, error: 'Inventory must be a positive number if provided.' };
    }
    const active = activeStr === 'true';

    const supabase = vendorServerClient();

    // Upload new image only if a new base64 was provided; otherwise keep existing URL
    const imageUrl = imageBase64
      ? await uploadDealImage(supabase, imageBase64, imageFilename)
      : existingImageUrl;

    const { error } = await supabase.rpc('vendor_update_deal', {
      p_item_id: itemId,
      p_title: title,
      p_description: description || null,
      p_image_url: imageUrl,
      p_cost_credits: cost,
      p_inventory_remaining: inventory,
      p_active: active,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/vendor/deals');
    return { ok: true };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}

export async function toggleDeal(formData: FormData): Promise<ActionResult> {
  try {
    await requireVendor();

    const itemId = (formData.get('item_id') as string | null)?.trim() ?? '';
    const title = (formData.get('title') as string | null)?.trim() ?? '';
    const description = (formData.get('description') as string | null)?.trim() ?? '';
    const existingImageUrl = (formData.get('existing_image_url') as string | null) ?? null;
    const costStr = formData.get('cost_credits') as string | null;
    const inventoryStr = formData.get('inventory_remaining') as string | null;
    // new_active is the flipped value (passed from the client)
    const newActiveStr = formData.get('new_active') as string | null;

    if (!itemId) return { ok: false, error: 'Missing deal ID.' };
    const cost = parseInt(costStr ?? '', 10);
    const inventory = inventoryStr ? parseInt(inventoryStr, 10) : null;
    const newActive = newActiveStr === 'true';

    const supabase = vendorServerClient();
    const { error } = await supabase.rpc('vendor_update_deal', {
      p_item_id: itemId,
      p_title: title,
      p_description: description || null,
      p_image_url: existingImageUrl,
      p_cost_credits: cost,
      p_inventory_remaining: inventory,
      p_active: newActive,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/vendor/deals');
    return { ok: true };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}

export async function addCodes(formData: FormData): Promise<ActionResult> {
  try {
    await requireVendor();

    const itemId = (formData.get('item_id') as string | null)?.trim() ?? '';
    const rawCodes = (formData.get('codes') as string | null) ?? '';

    if (!itemId) return { ok: false, error: 'Missing deal ID.' };

    // Split on newlines AND commas, trim, filter empties, deduplicate
    const codes = [
      ...new Set(
        rawCodes
          .split(/[\n,]+/)
          .map((c) => c.trim())
          .filter(Boolean),
      ),
    ];

    if (codes.length === 0) return { ok: false, error: 'No codes found. Enter one code per line.' };

    const supabase = vendorServerClient();
    const { data, error } = await supabase.rpc('vendor_add_codes', {
      p_item_id: itemId,
      p_codes: codes,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/vendor/deals');
    return { ok: true, message: `${data ?? codes.length} code(s) added successfully.` };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}
