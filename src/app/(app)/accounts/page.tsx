import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import AccountSummary from "@/components/AccountSummary";
import QuickActions from "@/components/QuickActions";
import SecurityPanel from "@/components/SecurityPanel";
import Link from "next/link";

function fmtUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function AccountsPage() {
  const { user } = await requireSession();
  const userId = (user as any).id as string;

  const base = await prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true, type: true, currency: true },
    orderBy: { name: "asc" },
  });

  const accounts = await Promise.all(
    base.map(async (a) => {
      const agg = await prisma.transaction.aggregate({
        where: { accountId: a.id },
        _sum: { amount: true },
      });
      return { ...a, balance: agg._sum.amount ?? 0 };
    })
  );

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  // choose first account for statement quick-link (optional)
  const firstAccountId = accounts[0]?.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Summary + Actions */}
      <div className="lg:col-span-2 space-y-8">
        <AccountSummary totalBalance={totalBalance} accounts={accounts} />
        {/* Account list with better readability */}
        <div className="bg-white rounded-2xl border shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Accounts</h2>
            <Link
              href="/accounts/new"
              className="px-3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              New
            </Link>
          </div>
          <div className="mt-4 divide-y">
            {accounts.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-md px-2"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {a.name}
                  </div>
                  <div className="text-sm text-gray-800">
                    {a.type} • {a.currency || "USD"}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 tabular-nums">
                  {fmtUSD(a.balance)}
                </div>
              </Link>
            ))}
            {accounts.length === 0 && (
              <div className="py-6 text-gray-700">No accounts yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Actions + Security */}
      <div className="space-y-8">
        <QuickActions firstAccountId={firstAccountId} />
        <SecurityPanel />
      </div>
    </div>
  );
}
