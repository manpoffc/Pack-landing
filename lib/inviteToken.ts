/**
 * Generates a URL-safe random token suitable for vendor invite links.
 * Uses Web Crypto (crypto.getRandomValues) — works in both Node.js and Edge runtimes.
 * Output is a 64-character lowercase hex string (256 bits of entropy).
 */
export function newInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
