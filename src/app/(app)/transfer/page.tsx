import { transferAction } from "./actions";
import { prisma } from "@/lib/db";
import type { BankAccount } from "@prisma/client";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Single server action the form will post to. */

export default async function TransferPage() {
  const { user } = await requireSession();
  const userId = user.id;

  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" }, // change to createdAt if you prefer
  });

  // Guard: need at least 2 accounts to transfer
  if (accounts.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Transfer Funds</h1>
            <p className="text-gray-600">
              You need at least two accounts to make a transfer. Please create
              another account first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Transfer Funds</h1>
          <p>Move money between your accounts instantly</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form action={transferAction} className="space-y-6">
            {/* FROM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                name="from"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                defaultValue={accounts[0]?.id}
                required
              >
                {accounts.map((a: BankAccount) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) ?? "0000"}
                  </option>
                ))}
              </select>
            </div>

            {/* TO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                name="to"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                defaultValue={accounts[1]?.id}
                required
              >
                {accounts.map((a: BankAccount) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) ?? "0000"}
                  </option>
                ))}
              </select>
            </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-8"
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* MEMO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                name="memo"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                placeholder="Rent split, savings transfer, etc."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              Transfer Funds
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 p-2 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Instant Transfers</h3>
            </div>
            <p className="text-green-200 text-sm">
              Funds are transferred immediately between your accounts with no
              delays.
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
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Secure & Encrypted</h3>
            </div>
            <p className="text-purple-200 text-sm">
              All transactions are protected with bank-level security and
              encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
