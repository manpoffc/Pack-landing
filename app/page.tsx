import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AppPreview } from '@/components/AppPreview';
import { Features } from '@/components/Features';
import { ToteShowcase } from '@/components/ToteShowcase';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AppPreview />
        <Features />
        <ToteShowcase />
        <HowItWorks />
        <Footer />
      </main>
    </>
  );
}
