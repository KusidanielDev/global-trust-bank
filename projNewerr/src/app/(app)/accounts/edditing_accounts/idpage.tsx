import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD, getBalCents, getTxnCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountDetail({
  params,
}: {
  params: { id: string };
}) {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;
  const id = params.id;

  const account = await prisma.account.findFirst({ where: { id, userId } });
  if (!account)
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-600">
        Account not found.
      </div>
    );

  const tx = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {account.name}
          </h1>
          <p className="text-gray-600">{account.type}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">Current balance</div>
          <div className="text-2xl font-extrabold text-gray-900">
            {fmtUSD(getBalCents(account))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/(app)/transfer"
          className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Transfer
        </Link>
        <Link
          href="/(app)/deposit"
          className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black transition-colors"
        >
          Deposit
        </Link>
      </div>

      <div className="mt-4 bg-white rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-2 px-3 text-left font-medium">Date</th>
              <th className="py-2 px-3 text-left font-medium">Description</th>
              <th className="py-2 px-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tx.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="py-2 px-3">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="py-2 px-3">{t.description}</td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={
                      getTxnCents(t) < 0 ? "text-red-600" : "text-green-700"
                    }
                  >
                    {fmtUSD(getTxnCents(t))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
