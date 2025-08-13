import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtUSD, getBalCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const { user } = await requireSession();
  const userId = (user as any)?.id as string;

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Accounts</h1>
        <Link
          href="/(app)/accounts/new"
          className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Open account
        </Link>
      </div>

      {accounts.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc: any) => (
            <Link
              key={acc.id}
              href={`/(app)/accounts/${acc.id}`}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="text-sm text-gray-600">{acc.type}</div>
              <div className="mt-1 text-lg font-bold text-gray-900">
                {acc.name}
              </div>
              <div className="mt-2 text-xl font-extrabold">
                {fmtUSD(getBalCents(acc))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(acc.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-600">
          No accounts yet. Open your first account to get started.
        </div>
      )}
    </div>
  );
}
