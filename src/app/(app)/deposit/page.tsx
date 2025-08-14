import React from "react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { depositAction } from "./actions";

// Next.js App Router hint: this page should always render dynamically
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

/* ========================================================================== *
 * Utilities
 * ========================================================================== */

/**
 * Transaction-safe recompute using the provided `tx` client. This ensures the
 * mirror balance on BankAccount is always consistent with the sum of all
 * Transaction rows — and it happens in the same database transaction to avoid
 * race conditions.
 */
// async function recomputeTx(db: DbClient, accountId: string) {
//   const sum = await db.transaction.aggregate({
//     where: { accountId },
//     _sum: { amountCents: true },
//   });

//   await db.bankAccount.update({
//     where: { id: accountId },
//     data: { balanceCents: sum._sum.amountCents ?? 0 },
//   });
// }

/**
 * Safely parse an amount to integer cents, throwing if invalid or non-positive.
 * Uses your shared `toCents` helper to keep input behavior consistent.
 */
// function parseAmountToCents(v: FormDataEntryValue | null): number {
//   const n = Number(v);
//   if (!Number.isFinite(n)) throw new Error("Amount is not a number");
//   const cents = toCents(n);
//   if (cents <= 0) throw new Error("Amount must be greater than 0");
//   return cents;
// }

/**
 * Simple currency formatter for display-only UI.
 */
function fmtUSD(cents?: number | null) {
  return (Math.round(cents ?? 0) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/* ========================================================================== *
 * Server Action: depositAction
 * ========================================================================== */

/**
 * Server Action for deposits. We keep `"use server"` inside the function body so
 * this file can still export constants like `dynamic`. The flow is:
 *
 *  1) Validate session and account ownership
 *  2) Insert a positive transaction row
 *  3) Recompute the account mirror inside the same DB transaction
 *  4) Revalidate + redirect to dashboard
 */

/* ========================================================================== *
 * Page Component (Server)
 * ========================================================================== */

/**
 * The deposit page. Because we didn't mark the entire file with "use server",
 * we can export `dynamic` without errors. This component is still a Server
 * Component by default (no "use client"), and can run server-side queries.
 */
export default async function DepositPage() {
  const { user } = await requireSession();
  const userId = user.id;

  // Use the BankAccount model consistently
  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      accountNumber: true,
      balanceCents: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* ================================================================== */}
        {/* Hero / Context                                                      */}
        {/* ================================================================== */}
        <header className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">Check Deposit</h1>
            <p className="text-sm opacity-95">
              Securely deposit checks using your mobile device. Each deposit
              writes a transaction and your account balance is mirrored from the
              ledger within the same database transaction.
            </p>
            <p className="text-xs opacity-80 mt-2">
              Image scanning and fraud checks are simulated.
            </p>
          </div>

          {/* Accounts Snapshot */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Your Accounts
            </h2>
            <ul className="divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <li className="py-2 text-sm text-gray-500">
                  No accounts available yet.
                </li>
              ) : (
                accounts.map((a) => (
                  <li
                    key={a.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-100 text-green-700 grid place-items-center font-semibold">
                        {a.name?.slice(0, 1).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {a.name}{" "}
                          <span className="text-gray-400 font-normal">
                            ••••{a.accountNumber?.slice(-4) || "0000"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {a.type || "checking"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fmtUSD(a.balanceCents)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </header>

        {/* ================================================================== */}
        {/* Deposit Form                                                        */}
        {/* ================================================================== */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">New Deposit</h3>

          <form action={depositAction} className="space-y-6">
            {/* Account Select */}
            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                To Account
              </label>
              <select
                id="accountId"
                name="accountId" // IMPORTANT: matches server action
                required
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                defaultValue={accounts[0]?.id || ""}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) || "0000"} —{" "}
                    {fmtUSD(a.balanceCents)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the destination account for this deposit.
              </p>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-8"
                  placeholder="100.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The deposit amount must be greater than zero.
              </p>
            </div>

            {/* Memo */}
            <div>
              <label
                htmlFor="memo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Memo (optional)
              </label>
              <input
                id="memo"
                name="memo"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                placeholder="Paycheck, tax refund, gift..."
              />
            </div>

            {/* Upload Widget Placeholder */}
            <div className="border border-dashed border-gray-300 rounded-xl p-6">
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl w-full h-48 flex flex-col items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <p className="text-gray-600 text-sm">
                  Upload front and back of the check
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF (10MB max each)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Upload Check Images
                </button>
                <span className="text-xs text-gray-500">
                  (In production, server-side checks would verify endorsements,
                  MICR, etc.)
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                By depositing, you agree to the Mobile Deposit Terms.
              </div>
              <button className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-md">
                Deposit Check
              </button>
            </div>

            {/* Note */}
            <div className="text-xs text-gray-500 mt-4 text-center">
              * This is a demo environment — no real money moves.
            </div>
          </form>
        </section>

        {/* ================================================================== */}
        {/* Feature Highlights                                                  */}
        {/* ================================================================== */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Secure Processing</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Check images are encrypted at rest and in transit. Back-end
              validation can include duplicate detection, MICR parsing, and
              endorsement verification to prevent fraud.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Fast Availability</h3>
            </div>
            <p className="text-purple-100 text-sm leading-relaxed">
              First $225 typically available immediately; the remainder clears
              next business day, subject to review and institution policy.
            </p>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Guidelines                                                          */}
        {/* ================================================================== */}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Deposit Guidelines
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Endorse the back with{" "}
                <em className="font-medium">“For Mobile Deposit Only”</em> and
                your signature.
              </span>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Ensure all four corners of the check are visible.</span>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Deposits made before 8 PM EST are processed the same day.
              </span>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Retain the physical check for 14 days after deposit.</span>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                If an image is flagged, you may be asked to resubmit clearer
                photos.
              </span>
            </li>
          </ul>
        </section>

        {/* ================================================================== */}
        {/* FAQ / Troubleshooting                                               */}
        {/* ================================================================== */}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">
                  My deposit shows, but the balance didnt change?
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                Balances are mirrored from the sum of transactions. We recompute
                within the *same* DB transaction to avoid race conditions. If
                you still see a mismatch, refresh or check availability holds.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">
                  What file types can I upload?
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                JPG, PNG, and PDF are supported. Keep each file under 10MB and
                ensure the MICR line and endorsements are legible.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">When are funds available?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                Availability varies. Typically $225 is available immediately;
                the remainder is available the next business day, pending
                review.
              </div>
            </details>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Footer                                                              */}
        {/* ================================================================== */}
        <footer className="mt-10 text-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Global Trust Bank. All rights reserved.
            Mobile deposits are subject to review and your institutions funds
            availability policy.
          </p>
        </footer>
      </div>
    </div>
  );
}
