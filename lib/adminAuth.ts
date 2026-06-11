/**
 * Admin auth helpers — Web Crypto only (works in Node.js runtime AND edge runtime).
 *
 * The cookie stores an HMAC-SHA256 of a fixed payload ('admin-v1') keyed with
 * ADMIN_COOKIE_SECRET.  The raw password is never placed in the cookie; an
 * attacker who steals the cookie value cannot derive the secret.
 *
 * Constant-time comparison (via crypto.subtle.verify) prevents timing attacks
 * that could leak whether a presented token is "almost right".
 */

const PAYLOAD = 'admin-v1';

function enc(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): ArrayBuffer | null {
  if (hex.length % 2 !== 0) return null;
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr.buffer as ArrayBuffer;
}

/** Returns a hex-encoded HMAC-SHA256 of 'admin-v1' using the given secret. */
export async function signToken(secret: string): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc(PAYLOAD));
  return bufToHex(sig);
}

/**
 * Constant-time verification: re-derives the expected HMAC and compares with
 * crypto.subtle.verify (which is itself constant-time).
 */
export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const key = await importKey(secret);
    const sigBuf = hexToBuf(token);
    if (!sigBuf) return false;
    return await crypto.subtle.verify('HMAC', key, sigBuf, enc(PAYLOAD));
  } catch {
    return false;
  }
}
