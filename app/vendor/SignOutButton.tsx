'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorBrowserClient } from '@/lib/supabaseVendorBrowser';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = vendorBrowserClient();
    await supabase.auth.signOut();
    router.push('/vendor/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-cocoa hover:text-brick underline disabled:opacity-50 transition-opacity"
    >
      {loading ? 'Signing out…' : 'Log out'}
    </button>
  );
}
