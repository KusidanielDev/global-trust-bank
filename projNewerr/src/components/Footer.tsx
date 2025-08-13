
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot");

  if (isAuth) {
    return (
      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} GlobalTrust Bank.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/security" className="hover:text-gray-900">Security</Link>
            <Link href="/help" className="hover:text-gray-900">Help</Link>
            {/* Socials */}
            <div className="flex items-center gap-3 ml-4">
              <a aria-label="Twitter" href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.89-.54 1.57-1.4 1.89-2.42-.83.5-1.75.87-2.73 1.07A4.17 4.17 0 0 0 16.1 4c-2.3 0-4.16 1.9-4.16 4.25 0 .33.03.65.1.96-3.46-.18-6.52-1.9-8.57-4.52-.36.66-.56 1.42-.56 2.24 0 1.55.76 2.92 1.92 3.72-.71-.02-1.37-.22-1.95-.54v.05c0 2.17 1.5 3.98 3.48 4.39-.37.1-.76.15-1.16.15-.28 0-.56-.03-.83-.08.56 1.83 2.2 3.16 4.14 3.19A8.35 8.35 0 0 1 2 19.54a11.75 11.75 0 0 0 6.4 1.9c7.68 0 11.88-6.5 11.88-12.13 0-.19 0-.38-.01-.57.82-.6 1.53-1.35 2.1-2.21z"/></svg>
              </a>
              <a aria-label="Facebook" href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.95v-7.04H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.04A10 10 0 0 0 22 12"/></svg>
              </a>
              <a aria-label="LinkedIn" href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zm7.5 0h3.84v2.05h.05c.53-1 1.84-2.05 3.8-2.05 4.07 0 4.82 2.68 4.82 6.17V23h-4v-5.51c0-1.31-.02-2.98-1.82-2.98-1.83 0-2.11 1.43-2.11 2.9V23h-4V8z"/></svg>
              </a>
              <a aria-label="YouTube" href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2s-.23-1.63-.95-2.35c-.9-.95-1.9-.95-2.36-1C16.9 2.5 12 2.5 12 2.5h-.01s-4.9 0-8.19.35c-.46.05-1.46.05-2.36 1C.73 4.57.5 6.2.5 6.2S.27 8.1.27 9.99v1.98C.27 13.85.5 15.8.5 15.8s.23 1.63.95 2.35c.9.95 2.08.92 2.61 1.02 1.9.18 8 .35 8 .35s4.9-.01 8.19-.36c.46-.05 1.46-.05 2.36-1 .72-.72.95-2.35.95-2.35s.23-1.95.23-3.83V9.99c0-1.89-.23-3.79-.23-3.79zM9.75 13.5v-5l5 2.5-5 2.5z"/></svg>
              </a>
              <a aria-label="Instagram" href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.75-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
  <footer className="mt-10 border-t bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="text-xl font-extrabold text-gray-900">GlobalTrust Bank</div>
          <p className="mt-3 text-sm text-gray-600">
            Modern banking for everyday life — secure, fast, and human.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
            <span className="rounded-full border px-2 py-1">FDIC‑insured deposits (via partners)</span>
            <span className="rounded-full border px-2 py-1">Equal Housing Lender</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Banking</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a href="/(app)/accounts" className="hover:text-gray-900">Checking</a></li>
            <li><a href="/(app)/accounts" className="hover:text-gray-900">Savings</a></li>
            <li><a href="/(app)/transfer" className="hover:text-gray-900">Transfers</a></li>
            <li><a href="/(app)/deposit" className="hover:text-gray-900">Mobile deposit</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Cards & Loans</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a href="/(app)/cards" className="hover:text-gray-900">Credit cards</a></li>
            <li><a href="/(app)/loans" className="hover:text-gray-900">Personal loans</a></li>
            <li><a href="/(app)/loans/apply" className="hover:text-gray-900">Apply for a loan</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Security</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a href="/security" className="hover:text-gray-900">Security center</a></li>
            <li><a href="/privacy" className="hover:text-gray-900">Privacy</a></li>
            <li><a href="/support" className="hover:text-gray-900">Report fraud</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Resources</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a href="/support" className="hover:text-gray-900">Help & support</a></li>
            <li><a href="/fees" className="hover:text-gray-900">Fees</a></li>
            <li><a href="/docs" className="hover:text-gray-900">Developer</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-xs text-gray-600 space-y-4">
        <p>
          Deposit products are provided by partner banks, Members FDIC. Certain conditions apply. Rates are subject
          to change. See our disclosures for details.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} GlobalTrust Bank.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-900">Accessibility</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

}
