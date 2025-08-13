// app/withdrawal/page.tsx
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

async function withdraw(formData: FormData) {
  "use server";
  const accountId = String(formData.get("accountId"));
  const amount = parseFloat(String(formData.get("amount")));
  if (!accountId || !Number.isFinite(amount) || amount <= 0) return;

  await prisma.transaction.create({
    data: {
      accountId,
      amount: -amount,
      date: new Date(),
      description: "Withdrawal",
      category: "Withdrawal",
    },
  });

  // create notification
  await prisma.notification.create({
    data: {
      title: `Withdrawal successful`,
      body: `Your withdrawal was completed.`,
    },
  });

  redirect(`/accounts/${accountId}?ok=withdraw`);
}

export default async function WithdrawPage() {
  const { user } = await requireSession();
  const userId = (user as any).id as string;

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true, accountNumber: true, type: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Withdraw Funds</h1>
          <p>Transfer money from your account to an external bank</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form action={withdraw} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                name="accountId"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ••••{a.accountNumber?.slice(-4) || "0000"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3 pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-3"
                  placeholder="External bank account number"
                  required
                />
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-gray-900 to-black text-white rounded-lg py-3.5 font-medium hover:from-gray-800 hover:to-gray-900 transition-all shadow-md">
              Withdraw Funds
            </button>

            <div className="text-xs text-gray-500 mt-4 text-center">
              <p>
                * This is a demo environment. No real money is moved.
                <br />
                Withdrawals may take 1-3 business days to process.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-2 rounded-lg mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Secure Withdrawals</h3>
          </div>
          <p className="text-blue-200 text-sm">
            All transactions are protected with bank-level encryption and
            monitored 24/7 for suspicious activity. Your funds are FDIC insured
            up to $250,000.
          </p>
        </div>
      </div>
    </div>
  );
}
