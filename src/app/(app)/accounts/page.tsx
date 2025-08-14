import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const { user } = await requireSession();
  const userId = user.id;

  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Accounts</h1>
            <p className="text-gray-600">
              Manage all your banking accounts in one place
            </p>
          </div>
        </div>

        {/* Accounts list */}
        {accounts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`} // ✅ Direct link to account detail
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {account.name}
                      </h2>
                      <p className="text-gray-600">
                        {account.type || "Account"}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      ••••{account.accountNumber?.slice(-4) || "1234"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-3xl font-extrabold text-gray-900">
                      {fmtUSD(account.balanceCents ?? 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(
                        account.updatedAt ?? Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* Open New Account card — only visible one */}
            <Link
              href="/accounts/new" // ✅ Correct link to open account page
              className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center p-8"
            >
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Open New Account
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Get started with a new checking, savings, or investment account
              </p>
              <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm">
                Get Started
              </span>
            </Link>
          </div>
        ) : (
          <div className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Accounts Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              You don&apos;t have any active accounts. Open your first account
              to start managing your finances.
            </p>
            <Link
              href="/accounts/new" // ✅ Direct link here too
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              Open Your First Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
