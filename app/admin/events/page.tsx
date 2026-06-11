import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/adminAuth';
import { EventCard } from './EventCard';

// Defense-in-depth: middleware already gates /admin/*, but server actions wield
// the service-role key, so re-verify the admin cookie inside every action.
// Auth must not live in exactly one place when the blast radius is this large.
async function requireAdmin() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  const token = cookies().get('pack_admin')?.value;
  if (!secret || !token || !(await verifyToken(token, secret))) {
    throw new Error('Not authorized');
  }
}

async function reviewEvent(
  formData: FormData,
  status: 'approved' | 'rejected' | 'cancelled',
) {
  await requireAdmin();
  const eventId = formData.get('event_id') as string;
  const note = (formData.get('note') as string | null) ?? '';
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('review_event', {
    p_event_id: eventId,
    p_status: status,
    p_note: note || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/events');
}

export const metadata: Metadata = {
  title: 'Event Review — Pack Admin',
  robots: { index: false, follow: false },
};

// Force dynamic so the page always reflects the latest DB state.
export const dynamic = 'force-dynamic';

// ---------- types ----------

export type EventRow = {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  venue_name: string | null;
  venue_address: string | null;
  lat: number | null;
  lng: number | null;
  starts_at: string;
  ends_at: string;
  banner_url: string | null;
  capacity: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

// ---------- server actions ----------

async function approveEvent(formData: FormData) {
  'use server';
  await reviewEvent(formData, 'approved');
}

async function rejectEvent(formData: FormData) {
  'use server';
  await reviewEvent(formData, 'rejected');
}

async function cancelEvent(formData: FormData) {
  'use server';
  await reviewEvent(formData, 'cancelled');
}

// ---------- data fetching ----------

async function fetchEvents(): Promise<{ pending: EventRow[]; approved: EventRow[] }> {
  const sb = supabaseAdmin();

  const [pendingRes, approvedRes] = await Promise.all([
    sb
      .from('events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    sb
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true }),
  ]);

  if (pendingRes.error) throw new Error(pendingRes.error.message);
  if (approvedRes.error) throw new Error(approvedRes.error.message);

  return {
    pending: (pendingRes.data ?? []) as EventRow[],
    approved: (approvedRes.data ?? []) as EventRow[],
  };
}

// ---------- page ----------

export default async function AdminEventsPage() {
  const { pending, approved } = await fetchEvents();

  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* admin nav */}
        <nav className="flex gap-4 mb-8 text-sm">
          <span className="text-espresso font-semibold">Event Review</span>
          <span className="text-sand">/</span>
          <a href="/admin/vendors" className="text-cocoa hover:text-espresso underline">
            Vendor Management
          </a>
        </nav>

        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso">
              Event Review
            </h1>
            <p className="text-sm text-cocoa mt-1">
              {pending.length} pending &middot; {approved.length} upcoming approved
            </p>
          </div>
          <a
            href="/api/admin/logout"
            className="text-sm text-cocoa hover:text-brick underline"
          >
            Log out
          </a>
        </div>

        {/* pending */}
        <section className="mb-14">
          <h2 className="font-display text-xl font-bold text-espresso mb-4">
            Pending review
          </h2>
          {pending.length === 0 ? (
            <p className="text-cocoa text-sm">No events awaiting review.</p>
          ) : (
            <div className="space-y-6">
              {pending.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  mode="pending"
                  approveAction={approveEvent}
                  rejectAction={rejectEvent}
                  cancelAction={cancelEvent}
                />
              ))}
            </div>
          )}
        </section>

        {/* approved upcoming */}
        <section>
          <h2 className="font-display text-xl font-bold text-espresso mb-4">
            Approved &amp; upcoming
          </h2>
          {approved.length === 0 ? (
            <p className="text-cocoa text-sm">No upcoming approved events.</p>
          ) : (
            <div className="space-y-6">
              {approved.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  mode="approved"
                  approveAction={approveEvent}
                  rejectAction={rejectEvent}
                  cancelAction={cancelEvent}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
