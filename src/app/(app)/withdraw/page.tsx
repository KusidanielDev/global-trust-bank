import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import SubmitButton from "@/components/SubmitButton";
import { redirect } from "next/navigation";

async function withdraw(formData: FormData) {
  "use server";
  const { user } = await requireSession();
  const userId = user.id as string;

  const accountId = String(formData.get("accountId") || "");
  const amountStr = String(formData.get("amount") || "0").replace(/[, ]/g, "");
  const cents = Math.round(Number(amountStr) * 100);

  if (!accountId || !Number.isFinite(cents) || cents <= 0) {
    throw new Error("Invalid amount.");
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new Error("Account not found.");

  // Optional: enforce no negative after withdrawal (compute current balance)
  const total = await prisma.transaction.aggregate({
    where: { accountId },
    _sum: { amount: true },
  });
  const balance = total._sum.amount ?? 0;
  if (balance - cents < 0) {
    throw new Error("Insufficient funds.");
  }

  await prisma.transaction.create({
    data: {
      accountId,
      userId,
      amount: -cents, // − for withdraw
      // kind: "WITHDRAW",
      // memo: "ATM withdrawal",
    },
  });

  redirect(`/accounts/${accountId}`);
}

export default async function WithdrawPage() {
  const { user } = await requireSession();
  const accts = await prisma.account.findMany({
    where: { userId: user.id as string },
    select: { id: true, name: true, type: true },
  });

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl border shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Withdraw</h1>
      <p className="text-gray-800 mb-6">
        Take money out from one of your accounts.
      </p>

      <form action={withdraw} className="space-y-4">
        <div>
          <label className="block text-gray-900 font-medium mb-1">
            Account
          </label>
          <select
            name="accountId"
            className="w-full rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {accts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} • {a.type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-900 font-medium mb-1">
            Amount (USD)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="50.00"
            className="w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <SubmitButton className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
          Withdraw
        </SubmitButton>
      </form>
    </div>
  );
}
