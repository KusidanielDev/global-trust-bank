export default function PublicFooter() {
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
              <span className="rounded-full border px-2 py-1">FDIC-insured deposits (via partners)</span>
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
