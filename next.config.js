/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

const devCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:3000 http://localhost:4000 ws:",
  "frame-src 'self' https://sandbox.plaid.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const prodCsp = [
  "default-src 'self'",
  "script-src 'self'", // no inline/eval in prod
  "style-src 'self' 'unsafe-inline'", // allow inline styles or move to non-inline if you want stricter
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // add your API origin here instead of localhost:
  "connect-src 'self' https://sandbox.plaid.com https://api.yourbank.com",
  "frame-src 'self' https://sandbox.plaid.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Security headers
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: isDev ? devCsp : prodCsp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // X-XSS-Protection is deprecated; safe to omit
        ],
      },
    ];
  },
};

module.exports = nextConfig;
