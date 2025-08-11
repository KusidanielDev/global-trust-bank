import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: any) {
  const { user } = await requireSession();
  const q = String(searchParams?.q || "").trim();

  let accounts: any[] = [];
  let transactions: any[] = [];
  if (q) {
    accounts = await prisma.account.findMany({
      where: {
        userId: (user as any).id,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { type: { contains: q, mode: "insensitive" } },
          { currency: { contains: q, mode: "insensitive" } },
          { accountNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    });
    transactions = await prisma.transaction.findMany({
      where: {
        account: { userId: (user as any).id },
        OR: [
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
      take: 20,
      include: { account: { select: { id:true, name:true } } },
    });
  }

  return (
    <div className="space-y-8">
      <form className="bg-white rounded-xl border shadow p-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search accounts or transactions..."
          className="w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
          <div className="mt-3 space-y-2">
            {q && accounts.map(a => (
              <Link key={a.id} href={`/accounts/${a.id}`} className="block p-3 border rounded-lg hover:shadow">
                <div className="font-semibold text-gray-900">{a.name}</div>
                <div className="text-sm text-gray-800">{a.type} • {a.currency} • ****{a.accountNumber?.slice(-4)}</div>
              </Link>
            ))}
            {q && accounts.length===0 && <div className="text-gray-700">No accounts found.</div>}
            {!q && <div className="text-gray-700">Type a search above.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <div className="mt-3 space-y-2">
            {q && transactions.map(t => (
              <div key={t.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-900">{t.description}</div>
                    <div className="text-xs text-gray-700">{new Date(t.date).toLocaleString()} • {t.account.name}</div>
                  </div>
                  <div className={(t.amount<0?"text-red-600":"text-green-700")+" font-semibold tabular-nums"}>
                    {(t.amount<0? "-" : "+") + (Math.abs(t.amount)).toLocaleString("en-US",{style:"currency",currency:"USD"})}
                  </div>
                </div>
              </div>
            ))}
            {q && transactions.length===0 && <div className="text-gray-700">No transactions found.</div>}
            {!q && <div className="text-gray-700">Results will appear here.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
