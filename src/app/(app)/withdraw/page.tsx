import React from "react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma, PrismaClient } from "@prisma/client";
import { withdrawAction } from "./actions";

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Transaction-safe recompute using the provided transaction client.
 * Keeps BankAccount.balanceCents mirrored to the sum of its transactions.
 */
async function recomputeTx(db: DbClient, accountId: string) {
  const sum = await db.transaction.aggregate({
    where: { accountId },
    _sum: { amountCents: true },
  });
  await db.bankAccount.update({
    where: { id: accountId },
    data: { balanceCents: sum._sum.amountCents ?? 0 },
  });
}

/**
 * Parse and validate a withdrawal amount (positive number, returns integer cents).
 */
function parseAmountToCents(v: FormDataEntryValue | null): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error("Amount is not a number");
  const cents = Math.round(n * 100);
  if (cents <= 0) throw new Error("Amount must be greater than 0");
  return cents;
}

/**
 * Server Action: Withdraw funds
 * - Validates session and account ownership
 * - Inserts a negative transaction
 * - Recomputes the account balance inside the same transaction
 * - Creates a notification (inside the transaction for consistency)
 * - Revalidates dashboard and redirects back
 */

/** Next.js hint: dynamic rendering (we're using server data) */
export const dynamic = "force-dynamic";

/**
 * Withdrawal page UI
 * Notes:
 * - Uses BankAccount model consistently (NOT `prisma.account`)
 * - Form field names align with action: accountId, amount, externalAccount, memo
 */
export default async function WithdrawPage() {
  const { user } = await requireSession();
  const userId = user.id;

  // Fetch accounts owned by the user
  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      accountNumber: true,
      type: true,
      balanceCents: true,
      createdAt: true,
    },
  });

  // currency helper
  const fmt = (cents?: number | null) =>
    (Math.round(cents ?? 0) / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Block */}
        <header className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">Withdraw Funds</h1>
            <p className="text-sm opacity-95">
              Move money from one of your accounts to an external destination.
              Withdrawals are recorded as negative transactions and your balance
              is mirrored from the transaction ledger.
            </p>
            <p className="text-xs opacity-80 mt-2">
              For demo purposes, external transfer execution is simulated.
            </p>
          </div>

          {/* Account snapshot */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Your Accounts
            </h2>
            <ul className="divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <li className="py-2 text-sm text-gray-500">
                  No accounts available.
                </li>
              ) : (
                accounts.map((a) => (
                  <li
                    key={a.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 grid place-items-center font-semibold">
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
                      {fmt(a.balanceCents)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </header>

        {/* Withdrawal Form */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            New Withdrawal
          </h3>

          <form action={withdrawAction} className="space-y-6">
            {/* From account */}
            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                From Account
              </label>
              <select
                id="accountId"
                name="accountId"
                required
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                defaultValue={accounts[0]?.id || ""}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) || "0000"} —{" "}
                    {fmt(a.balanceCents)}
                  </option>
                ))}
              </select>
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
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Withdrawals can’t exceed your available balance.
              </p>
            </div>

            {/* External account (demo) */}
            <div>
              <label
                htmlFor="externalAccount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                To (External Account / Note)
              </label>
              <input
                id="externalAccount"
                name="externalAccount"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                placeholder="External bank account number or note"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is a demo field. In production, you’d select a verified
                payee or bank link (e.g., Plaid).
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
                placeholder="ATM withdrawal, external transfer, etc."
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                By continuing, you agree to the Electronic Transfers Terms.
              </div>
              <button className="w-auto rounded-lg bg-gradient-to-r from-gray-900 to-black text-white px-5 py-3 font-medium hover:from-gray-800 hover:to-gray-900 transition-all shadow-md">
                Withdraw Funds
              </button>
            </div>

            {/* Info note */}
            <div className="text-xs text-gray-500 mt-4 text-center">
              <p>
                * Demo environment — no real money moves. Processing time for
                real withdrawals is typically 1–3 business days.
              </p>
            </div>
          </form>
        </section>

        {/* Security / Feature Card */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg mr-4">
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
              <h3 className="text-lg font-bold">Secure Withdrawals</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              All transactions are protected with bank-level encryption and
              monitored for suspicious activity. Limits and 2FA help protect
              your funds from unauthorized transfers.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tips for Smooth Transfers
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li>Ensure your external destination is verified.</li>
              <li>Double-check amounts and memo details before submitting.</li>
              <li>
                Large withdrawals may be subject to review and may clear next
                business day.
              </li>
              <li>Keep your contact info up to date for alerts.</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">
                  Why did my withdrawal get declined?
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                Reasons can include insufficient funds, account holds, scheduled
                maintenance, or exceeding daily limits. For demo, we only check
                basic balance availability.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">
                  Can I cancel a withdrawal after submitting?
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                In production, same-day cancellations may be possible before
                processing begins. In this demo, consider each submission final.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">How are balances computed?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-600">
                Your displayed balance mirrors the sum of all transactions. Each
                deposit/withdrawal updates the ledger, then we recompute the
                balance inside the same database transaction to avoid race
                conditions.
              </div>
            </details>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Global Trust Bank. All rights reserved.
            This is a demo application. Terms and conditions apply.
          </p>
        </footer>
      </div>
    </div>
  );
}
