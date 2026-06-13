import type { Metadata } from 'next';
import { VendorNav } from '@/components/vendor/VendorNav';
import { VendorHero } from '@/components/vendor/VendorHero';
import { VendorValueLoop } from '@/components/vendor/VendorValueLoop';
import { VendorBenefits } from '@/components/vendor/VendorBenefits';
import { VendorOffer } from '@/components/vendor/VendorOffer';
import { VendorImpactCalculator } from '@/components/vendor/VendorImpactCalculator';
import { VendorUseCases } from '@/components/vendor/VendorUseCases';
import { VendorOnboarding } from '@/components/vendor/VendorOnboarding';
import { VendorApply } from '@/components/vendor/VendorApply';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Pack for Business — reach local dog parents with deals & insights',
  description:
    'Put your business in front of dog parents walking your neighborhood every day. Publish credit-gated deals to the Pack marketplace, track every redemption, and get anonymized audience insights for your service area. Invite-based, free to join.',
  alternates: { canonical: '/vendors' },
  openGraph: {
    title: 'Pack for Business — deals & audience insights for local vendors',
    description:
      'Reach engaged local dog parents. Launch deals, measure redemptions, and understand your audience — privately. Request a vendor invite.',
    url: 'https://trypack.app/vendors',
    siteName: 'Pack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pack for Business — deals & audience insights for local vendors',
    description:
      'Reach engaged local dog parents. Launch deals, measure redemptions, understand your audience — privately.',
  },
};

export default function VendorsPage() {
  return (
    <>
      <VendorNav />
      <main>
        <VendorHero />
        <VendorValueLoop />
        <VendorBenefits />
        <VendorOffer />
        <VendorImpactCalculator />
        <VendorUseCases />
        <VendorOnboarding />
        <VendorApply />
        <Footer />
      </main>
    </>
  );
}
