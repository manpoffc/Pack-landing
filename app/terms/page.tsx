{/* DRAFT — review before launch */}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Pack',
  description:
    'Read the Pack Terms of Service covering eligibility, the credits program, tote fulfillment, acceptable use, and our veterinary disclaimer.',
};

export default function TermsPage() {
  return (
    <main className="bg-parchment min-h-screen">
      <div className="max-w-prose mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-bold text-espresso mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-cocoa mb-12">Last updated: June 10, 2026</p>

        <div className="prose prose-stone max-w-none text-espresso space-y-8">

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">1. Acceptance</h2>
            <p>
              By joining the Pack waitlist or using the Pack mobile application, you agree to these
              Terms of Service ("Terms"). If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use Pack. By using the service, you represent that
              you meet this requirement. If you are between 13 and 18, you may only use Pack with
              parental or guardian consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">3. The Credits Program</h2>
            <p>
              Pack awards in-app credits ("Pack Credits") for GPS-verified walks, successful referrals,
              and other activities at our discretion. Credits are subject to the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>No cash value.</strong> Credits cannot be exchanged for cash or transferred to
                another user.
              </li>
              <li>
                <strong>Anti-fraud verification.</strong> Walk submissions are verified using GPS data
                and, where required, a dog-in-photo check. Submissions that fail verification will not
                earn credits. Attempts to manipulate or spoof GPS data, submit fraudulent photos, or
                otherwise game the verification system may result in account suspension.
              </li>
              <li>
                <strong>Rebalancing.</strong> Pack may adjust credit earn rates and redemption costs at
                any time to maintain the health of the credit economy. We will provide reasonable
                advance notice of material changes via in-app notification.
              </li>
              <li>
                Credits expire 12 months after they are earned if the associated account has been
                inactive (no walks logged) for that period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">4. Tote Bag &amp; Merchandise Fulfillment</h2>
            <p>
              Pack may offer physical merchandise (including personalised tote bags) redeemable with
              credits or as a promotional reward. The following conditions apply:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Promotional tote offers (e.g., "first 200 walkers") are fulfilled on a first-come,
                first-served basis. Once the promotional inventory is exhausted, the offer ends.
              </li>
              <li>
                Fulfillment timelines are estimates. Pack is not liable for carrier delays.
              </li>
              <li>
                Personalised items (printed with your dog's name or photo) cannot be returned unless
                they arrive damaged or defective.
              </li>
              <li>
                Pack reserves the right to substitute an item of equal or greater value if a specific
                variant is unavailable.
              </li>
              <li>
                Charity-linked items: pledges to donate a portion of proceeds to partner organisations
                are batched and made on a quarterly basis.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Upload content that is illegal, harmful, threatening, or harassing</li>
              <li>Impersonate any person or entity</li>
              <li>Attempt to access another user's account without authorisation</li>
              <li>Reverse-engineer, scrape, or use automated means to extract data from Pack</li>
              <li>Use the service for any commercial purpose without our written consent</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">
              6. Veterinary Disclaimer
            </h2>
            <p className="bg-sand border-l-4 border-tangerine px-4 py-3 rounded">
              <strong>Pack is a walking companion, not a veterinary service.</strong> Content
              within the app — including breed-specific walk distance guidance, health tips, and any
              statistics related to your dog's activity — is provided for general informational and
              motivational purposes only. It does not constitute veterinary advice, diagnosis, or
              treatment. Every dog is different; factors such as age, health conditions, and
              individual fitness level affect what exercise is appropriate. Always consult a licensed
              veterinarian before making changes to your dog's exercise routine, especially if your
              dog has a known health condition or shows signs of discomfort. Pack expressly disclaims
              any liability for decisions made based on in-app content without professional
              veterinary consultation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">7. Intellectual Property</h2>
            <p>
              The Pack name, logo, and application are owned by Pack and protected by applicable
              intellectual property laws. You retain ownership of content you upload (photos, dog
              profiles) but grant Pack a non-exclusive, royalty-free licence to display that content
              within the service and to use aggregated, anonymised data to improve the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Pack and its affiliates shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages,
              including loss of profits, data, or goodwill, arising out of or in connection with your
              use of the service, even if we have been advised of the possibility of such damages.
              Our total liability to you for any claim arising out of these Terms or the service shall
              not exceed the greater of (a) USD 50 or (b) the amount you paid Pack in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">9. Disclaimers</h2>
            <p>
              The service is provided "as is" and "as available" without warranty of any kind. We do
              not warrant that the service will be uninterrupted, error-free, or free of harmful
              components.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of [Governing Jurisdiction — to be confirmed before
              launch], without regard to its conflict-of-law provisions. Any disputes shall be resolved
              in the courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">11. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the service after changes take
              effect constitutes acceptance. We will provide at least 14 days' notice of material
              changes via in-app notification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">12. Contact</h2>
            <p>
              Questions about these Terms:{' '}
              <a href="mailto:hello@trypack.app" className="text-tangerine underline">
                hello@trypack.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
