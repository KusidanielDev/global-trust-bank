import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import Link from "next/link";

function fmtUSD(n:number){return n.toLocaleString("en-US",{style:"currency",currency:"USD"})}

export default async function DashboardPage(){
  const { user } = await requireSession();
  const userId = (user as any).id as string;

  const accounts = await prisma.account.findMany({ where: { userId }, select: { id:true, name:true, type:true, currency:true } });

  // Compute balances by summing transactions for each account
  const balances = await Promise.all(accounts.map(async a => {
    const sum = await prisma.transaction.aggregate({ where: { accountId: a.id }, _sum: { amount: true } });
    return { ...a, balance: sum._sum.amount ?? 0 };
  }));

  const totalBalance = balances.reduce((s,a)=>s+(a.balance||0),0);

  const recent = await prisma.transaction.findMany({
    where: { accountId: { in: accounts.map(a=>a.id) } },
    orderBy: { date: "desc" },
    take: 10
  });

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border shadow p-5">
          <div className="text-sm text-gray-700">Total Balance</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{fmtUSD(totalBalance)}</div>
        </div>
        <div className="bg-white rounded-xl border shadow p-5">
          <div className="text-sm text-gray-700">Accounts</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{accounts.length}</div>
        </div>
        <div className="bg-white rounded-xl border shadow p-5">
          <div className="text-sm text-gray-700">Last Transaction</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">{recent[0] ? new Date(recent[0].date).toLocaleString() : "—"}</div>
        </div>
        <div className="bg-white rounded-xl border shadow p-5">
          <div className="text-sm text-gray-700">Currency</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">USD</div>
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-white rounded-xl border shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
          <Link href="/accounts/new" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Open Account</Link>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map(a=> (
            <Link key={a.id} href={`/accounts/${a.id}`} className="border rounded-xl p-4 hover:shadow transition-shadow">
              <div className="text-lg font-semibold text-gray-900">{a.name}</div>
              <div className="text-sm text-gray-800">{a.type} • {a.currency}</div>
              <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">{fmtUSD(a.balance||0)}</div>
            </Link>
          ))}
          {balances.length===0 && <div className="text-gray-700">No accounts yet.</div>}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Link href="/accounts" className="text-blue-700 hover:underline">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t=> (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{new Date(t.date).toLocaleString()}</td>
                  <td className="p-3 text-gray-900">{t.description}</td>
                  <td className={"p-3 text-right font-semibold tabular-nums " + (t.amount<0? "text-red-600":"text-green-700")}>
                    {(t.amount<0? "-" : "+") + fmtUSD(Math.abs(t.amount))}
                  </td>
                </tr>
              ))}
              {recent.length===0 && <tr><td colSpan={3} className="p-4 text-gray-700">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
