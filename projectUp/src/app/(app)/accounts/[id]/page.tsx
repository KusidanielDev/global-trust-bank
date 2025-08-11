import { prisma } from "@/lib/db";
import { fmtUSD } from "@/lib/money";
import Link from "next/link";

export default async function AccountDetail({ params }: { params: { id: string }}) {
  const accountId = params.id;
  const txs = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: { date: "desc" },
    select: { id: true, amount: true, date: true, description: true, category: true },
  });
  const balance = txs.reduce((sum, t) => sum + t.amount, 0);
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Account {accountId.slice(0,6)}…</h1>
        <div className="flex gap-2">
          <Link href="/deposit" className="px-3 py-2 bg-black text-white rounded">Deposit</Link>
          <Link href="/withdraw" className="px-3 py-2 border rounded">Withdraw</Link>
          <Link href="/transfer" className="px-3 py-2 border rounded">Transfer</Link>
        </div>
      </div>
      <div className="mb-4 text-lg">Balance: <span className="font-semibold">{fmtUSD(balance)}</span></div>
      <div className="rounded border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr><th className="text-left p-2">Date</th><th className="text-left p-2">Description</th><th className="text-left p-2">Category</th><th className="text-right p-2">Amount</th></tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2">{t.description}</td>
                <td className="p-2">{t.category}</td>
                <td className={"p-2 text-right " + (t.amount<0 ? "text-red-600":"text-green-700")}>{fmtUSD(t.amount)}</td>
              </tr>
            ))}
            {txs.length===0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
