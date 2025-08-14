// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Generate a base64 nonce using Web Crypto (works on the Edge runtime)
function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64 encode (avoid Buffer in Edge)
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();

  const nonce = generateNonce();
  // expose nonce to the app so you can use it in layout/pages
  res.headers.set("x-nonce", nonce);

  // Strict CSP with a nonce (no 'unsafe-inline')
  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' trusts anything loaded by a trusted (nonced) script
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    // keep inline styles allowed for Tailwind/style attrs; you can tighten later
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // add any endpoints you actually call from the browser:
    "connect-src 'self' https://vitals.vercel-insights.com https://vercel.live https://sandbox.plaid.com",
    "frame-src 'self' https://sandbox.plaid.com",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");

  // Security headers
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return res;
}

// Don’t run middleware for static assets (saves work, avoids duplicate headers)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
