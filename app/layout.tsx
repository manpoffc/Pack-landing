import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://trypack.app'),
  title: 'Pack — the social walking app for dog parents',
  description:
    "Real dogs, real walks, real credits — meet other dog parents nearby, earn rewards for walking, and turn habit into a community. Join the waitlist.",
  openGraph: {
    title: 'Pack — the social walking app for dog parents',
    description:
      "Meet dog parents nearby, earn credits for walking, redeem real perks. Join the waitlist.",
    url: 'https://trypack.app',
    siteName: 'Pack',
    type: 'website',
    // openGraph.images is automatically wired by Next.js from opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pack — the social walking app for dog parents',
    description:
      'Meet dog parents nearby, earn credits for walking, redeem real perks.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Pack',
      url: 'https://trypack.app',
      description:
        'Pack is the social walking app for dog parents. Meet nearby walkers, earn credits for every GPS-verified walk, and redeem real perks.',
    },
    {
      '@type': 'MobileApplication',
      name: 'Pack',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'iOS',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      url: 'https://trypack.app',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
