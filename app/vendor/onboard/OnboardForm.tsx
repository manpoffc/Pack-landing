'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  token: string;
  prefillEmail: string;
  prefillBusinessName: string;
};

function inputClass(extra?: string) {
  return `w-full border border-sand rounded-lg px-3 py-2 text-espresso bg-parchment focus:outline-none focus:ring-2 focus:ring-tangerine text-sm ${extra ?? ''}`;
}

function labelClass() {
  return 'block text-xs font-semibold text-cocoa mb-1';
}

export default function OnboardForm({
  token,
  prefillEmail,
  prefillBusinessName,
}: Props) {
  const router = useRouter();

  // Auth
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Business
  const [businessName, setBusinessName] = useState(prefillBusinessName);

  // Address
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  // URLs
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [onlineStore, setOnlineStore] = useState(false);

  // Logo
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string>('');

  // Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(prefillEmail);
  const [contactPhone, setContactPhone] = useState('');

  // Disclaimer
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation
  const passwordsMatch = password === confirmPassword;
  const passwordLongEnough = password.length >= 8;
  const canSubmit =
    disclaimerAccepted &&
    passwordLongEnough &&
    passwordsMatch &&
    businessName.trim().length > 0 &&
    line1.trim().length > 0 &&
    city.trim().length > 0 &&
    !loading;

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setLogoBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/vendor/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: prefillEmail,
          password,
          business_name: businessName.trim(),
          address_line1: line1.trim(),
          address_line2: line2.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country: country.trim(),
          website_url: websiteUrl.trim() || null,
          online_store: onlineStore,
          logo_base64: logoBase64,
          logo_filename: logoFilename || null,
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push('/vendor');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cream border border-sand rounded-2xl p-8 space-y-6 shadow-sm"
    >
      {/* ── Password ── */}
      <section>
        <h2 className="font-display text-lg font-bold text-espresso mb-4">
          Set your password
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="password" className={labelClass()}>
              Password <span className="text-brick">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass()}
              placeholder="Min 8 characters"
            />
            {password.length > 0 && !passwordLongEnough && (
              <p className="text-xs text-brick mt-1">
                Password must be at least 8 characters.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirm-password" className={labelClass()}>
              Confirm password <span className="text-brick">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass()}
              placeholder="Re-enter password"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-brick mt-1">Passwords do not match.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Business details ── */}
      <section>
        <h2 className="font-display text-lg font-bold text-espresso mb-4">
          Business details
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="business-name" className={labelClass()}>
              Business name <span className="text-brick">*</span>
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className={inputClass()}
              placeholder="Your business name"
            />
          </div>

          <div>
            <label htmlFor="line1" className={labelClass()}>
              Address line 1 <span className="text-brick">*</span>
            </label>
            <input
              id="line1"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
              className={inputClass()}
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label htmlFor="line2" className={labelClass()}>
              Address line 2
            </label>
            <input
              id="line2"
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              className={inputClass()}
              placeholder="Suite 100, Unit B, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className={labelClass()}>
                City <span className="text-brick">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className={inputClass()}
                placeholder="New York"
              />
            </div>
            <div>
              <label htmlFor="state" className={labelClass()}>
                State / Province
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass()}
                placeholder="NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="postal-code" className={labelClass()}>
                Postal code
              </label>
              <input
                id="postal-code"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={inputClass()}
                placeholder="10001"
              />
            </div>
            <div>
              <label htmlFor="country" className={labelClass()}>
                Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass()}
                placeholder="US"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website-url" className={labelClass()}>
              Website URL
            </label>
            <input
              id="website-url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={inputClass()}
              placeholder="https://yourshop.com"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="online-store"
              type="checkbox"
              checked={onlineStore}
              onChange={(e) => setOnlineStore(e.target.checked)}
              className="h-4 w-4 rounded border-sand accent-tangerine cursor-pointer"
            />
            <label
              htmlFor="online-store"
              className="text-sm text-espresso cursor-pointer"
            >
              We have an online store
            </label>
          </div>
        </div>
      </section>

      {/* ── Logo ── */}
      <section>
        <h2 className="font-display text-lg font-bold text-espresso mb-4">
          Logo
        </h2>
        <div className="space-y-3">
          {logoPreview && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-24 w-24 object-contain rounded-xl border border-sand bg-parchment"
              />
            </div>
          )}
          <div>
            <label htmlFor="logo" className={labelClass()}>
              Business logo (optional)
            </label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleLogoChange}
              className="w-full text-sm text-cocoa file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-tangerine file:text-white hover:file:opacity-90 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* ── Contact person ── */}
      <section>
        <h2 className="font-display text-lg font-bold text-espresso mb-4">
          Contact person
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="contact-name" className={labelClass()}>
              Full name
            </label>
            <input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClass()}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass()}>
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass()}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className={labelClass()}>
              Phone
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass()}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="bg-parchment border border-sand rounded-xl p-4">
        <div className="flex items-start gap-3">
          <input
            id="disclaimer"
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(e) => setDisclaimerAccepted(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-sand accent-tangerine cursor-pointer flex-shrink-0"
          />
          <label
            htmlFor="disclaimer"
            className="text-sm text-espresso leading-relaxed cursor-pointer"
          >
            <span className="font-semibold">Required: </span>I understand that
            Pack may suspend or cancel my vendor membership at any time, at its
            discretion.
          </label>
        </div>
      </section>

      {/* ── Error ── */}
      {error && (
        <p className="text-sm text-brick font-medium text-center" role="alert">
          {error}
        </p>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-tangerine text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {loading ? 'Creating your account…' : 'Complete registration'}
      </button>
    </form>
  );
}
