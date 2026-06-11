import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import OnboardForm from './OnboardForm';

export const metadata: Metadata = {
  title: 'Complete your vendor registration — Pack',
  robots: { index: false, follow: false },
};

// Force dynamic since we read searchParams and the token state changes.
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: { token?: string };
};

export default async function VendorOnboardPage({ searchParams }: PageProps) {
  const token = searchParams.token ?? '';

  // Validate the token server-side.
  if (!token) {
    return <InvalidInvite reason="No invite token was provided." />;
  }

  const admin = supabaseAdmin();
  const { data: invite, error } = await admin
    .from('vendor_invites')
    .select('email, business_name, expires_at, accepted_at, vendor_id')
    .eq('token', token)
    .single();

  if (error || !invite) {
    return <InvalidInvite reason="This invite link is invalid." />;
  }

  if (invite.accepted_at) {
    return <InvalidInvite reason="This invite has already been used. If you already completed registration, please sign in." />;
  }

  const now = new Date();
  const expiresAt = new Date(invite.expires_at);
  if (now > expiresAt) {
    return <InvalidInvite reason="This invite link has expired. Please contact hello@trypack.app to request a new one." />;
  }

  return (
    <main className="bg-parchment min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-espresso mb-2 text-center">
          Welcome to Pack Vendors
        </h1>
        <p className="text-center text-sm text-cocoa mb-8">
          Complete your registration to activate your vendor account.
        </p>
        <OnboardForm
          token={token}
          prefillEmail={invite.email}
          prefillBusinessName={invite.business_name ?? ''}
          vendorId={invite.vendor_id}
        />
      </div>
    </main>
  );
}

function InvalidInvite({ reason }: { reason: string }) {
  return (
    <main className="bg-parchment min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <h1 className="font-display text-2xl font-bold text-espresso mb-4">
          Invalid or expired invite
        </h1>
        <p className="text-cocoa text-sm mb-6">{reason}</p>
        <a
          href="mailto:hello@trypack.app"
          className="text-tangerine underline text-sm"
        >
          Contact us at hello@trypack.app
        </a>
      </div>
    </main>
  );
}
