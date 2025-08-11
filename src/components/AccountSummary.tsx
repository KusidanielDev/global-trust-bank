// components/AccountSummary.tsx
import Link from "next/link";

type Account = {
  id: string;
  name: string;
  type: string;
  currency?: string | null;
  balance: number; // in cents
};

function fmtUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function AccountSummary({
  totalBalance,
  accounts,
}: {
  totalBalance: number; // cents
  accounts: Account[];
}) {
  return (
    <div className="space-y-6">
      {/* Top KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-700">Total Balance</div>
          <div className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
            {fmtUSD(totalBalance)}
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-700">Accounts</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {accounts.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow p-5">
          <div className="text-sm text-gray-700">Primary Currency</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">USD</div>
        </div>
      </div>

      {/* Account cards */}
      <div className="bg-white rounded-2xl border shadow">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
          <Link
            href="/accounts/new"
            className="px-3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Open Account
          </Link>
        </div>
        <div className="px-6 pb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <Link
              key={a.id}
              href={`/accounts/${a.id}`}
              className="group border rounded-xl p-4 hover:shadow transition-shadow"
            >
              <div className="text-lg font-semibold text-gray-900">
                {a.name}
              </div>
              <div className="text-sm text-gray-800">
                {a.type} • {a.currency || "USD"}
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 tabular-nums">
                {fmtUSD(a.balance)}
              </div>
              <div className="mt-3 text-sm text-blue-700 group-hover:underline">
                View details →
              </div>
            </Link>
          ))}
          {accounts.length === 0 && (
            <div className="text-gray-700">
              No accounts yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
