import { Hero } from '@/components/landing/hero';
import { TrustBanner } from '@/components/landing/trust-banner';
import { Platform } from '@/components/landing/platform';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Capabilities } from '@/components/landing/capabilities';
import { Governance } from '@/components/landing/governance';
import { Outcomes } from '@/components/landing/outcomes';
import { FAQ } from '@/components/landing/faq';
import { ContactCTA } from '@/components/landing/contact-cta';
import { PrivacySection } from '@/components/landing/privacy-section';

import { SiteHeader } from '@/components/landing/site-header';
import { SiteFooter } from '@/components/landing/site-footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <TrustBanner />
      <div id="platform">
        <Platform />
      </div>
      <HowItWorks />
      <div id="capabilities">
        <Capabilities />
      </div>
      <Governance />
      <div id="outcomes">
        <Outcomes />
      </div>
      <FAQ />
      <ContactCTA />
      <PrivacySection />
      <SiteFooter />
    </main>
  );
}
