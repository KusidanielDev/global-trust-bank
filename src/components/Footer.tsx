// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-lg font-extrabold text-gray-900">
            GlobalTrust Bank
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Smarter banking. Better security. Real support.
          </p>
        </div>

        <div>
          <div className="font-semibold text-gray-900">Products</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link
                href="/accounts"
                className="text-gray-700 hover:text-gray-900"
              >
                Accounts
              </Link>
            </li>
            <li>
              <Link
                href="/transfer"
                className="text-gray-700 hover:text-gray-900"
              >
                Transfers
              </Link>
            </li>
            <li>
              <Link href="/loans" className="text-gray-700 hover:text-gray-900">
                Loans
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-gray-900">Company</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                About
              </Link>
            </li>
            <li>
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Press
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-gray-900">Support</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900"
              >
                Security
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="text-gray-700 hover:text-gray-900"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} GlobalTrust Bank. All rights reserved.
      </div>
    </footer>
  );
}
