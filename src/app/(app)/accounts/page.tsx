import { prisma } from "@/lib/db";
import Link from "next/link";
import { fmtUSD } from "@/lib/money";

async function getAccountsWithBalance(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });
  const results = [];
  for (const a of accounts) {
    const sum = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { accountId: a.id },
    });
    results.push({ id: a.id, balance: sum._sum.amount ?? 0 });
  }
  return results;
}

export default async function AccountsPage() {
  // TODO: replace with session user
  // For now, show all accounts (mock) if no session
  let accounts: { id: string; balance: number }[] = [];
  try {
    const { requireSession } = await import("@/lib/session");
    const session = await requireSession();
    accounts = await getAccountsWithBalance(session.user.id as string);
  } catch {
    accounts = await getAccountsWithBalance("demo");
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Accounts</h1>
      <div className="space-y-4">
        {accounts.map((a) => (
          <Link
            key={a.id}
            href={`/accounts/${a.id}`}
            className="block rounded border p-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="account-title">Account {a.id.slice(0, 6)}…</div>
                <div className="account-currency">USD</div>
                {/* <div className="account-number">#{a.accountNumber}</div> */}
              </div>
              <div className="account-balance">{fmtUSD(a.balance)}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href="/accounts/new"
          className="inline-block px-4 py-2 bg-black text-white rounded"
        >
          Open New Account
        </Link>
      </div>
    </div>
  );
}
