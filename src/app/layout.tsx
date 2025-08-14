// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic"; // 👈 ensure SSR so nonce can apply

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlobalTrust Bank | Your Financial Partner",
  description: "World-class banking services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        {/* Example if you ever add custom scripts:
        <Script src="https://example.com/sdk.js" nonce={nonce} strategy="afterInteractive" />
        OR
        <Script id="inline" nonce={nonce} dangerouslySetInnerHTML={{ __html: "console.log('ok')" }} />
        */}
      </body>
    </html>
  );
}
