import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import Link from "next/link";

function fmtUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function AccountDetail({ params, searchParams }: any) {
  const { user } = await requireSession();
  const id = params.id as string;

  // ownership guard
  const account = await prisma.account.findFirst({
    where: { id, userId: user.id as string },
  });
  if (!account) throw new Error("Account not found");

  // filters
  const from = searchParams?.from ? new Date(searchParams.from) : undefined;
  const to = searchParams?.to ? new Date(searchParams.to) : undefined;

  const where: any = { accountId: id };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [txs, agg] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.transaction.aggregate({
      where: { accountId: id },
      _sum: { amount: true },
    }),
  ]);
  const balance = agg._sum.amount ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border shadow p-6 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{account.name}</div>
          <div className="text-sm text-gray-800">{account.type} • USD</div>
        </div>
        <div className="text-3xl font-bold text-gray-900 tabular-nums">
          {fmtUSD(balance)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/deposit`}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Deposit
        </Link>
        <Link
          href={`/withdraw`}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Withdraw
        </Link>
        <Link
          href={`/transfer`}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Transfer
        </Link>
        <Link
          href={`/api/accounts/${id}/statement.csv`}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
        >
          Export CSV
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl border shadow p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-gray-900 font-medium mb-1">From</label>
          <input
            type="date"
            name="from"
            className="rounded border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={searchParams?.from || ""}
          />
        </div>
        <div>
          <label className="block text-gray-900 font-medium mb-1">To</label>
          <input
            type="date"
            name="to"
            className="rounded border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={searchParams?.to || ""}
          />
        </div>
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
          Apply
        </button>
      </form>

      {/* History */}
      <div className="bg-white rounded-xl border shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-900">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t, idx) => {
              const running =
                txs.slice(idx).reduce((s, x) => s + x.amount, 0) +
                (balance - txs.reduce((s, x) => s + x.amount, 0));
              return (
                <tr key={t.id} className="border-t">
                  <td className="p-3">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-900">
                    {t.memo || "Transaction"}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      t.amount < 0 ? "text-red-600" : "text-green-700"
                    } font-semibold tabular-nums`}
                  >
                    {t.amount < 0 ? "-" : "+"}
                    {fmtUSD(Math.abs(t.amount))}
                  </td>
                  <td className="p-3 text-right text-gray-900 tabular-nums">
                    {fmtUSD(running)}
                  </td>
                </tr>
              );
            })}
            {txs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-700">
                  No transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
