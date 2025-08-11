import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import SubmitButton from "@/components/SubmitButton";
import { redirect } from "next/navigation";

async function transfer(formData: FormData) {
  "use server";
  const { user } = await requireSession();
  const userId = user.id as string;

  const fromId = String(formData.get("fromId") || "");
  const toId = String(formData.get("toId") || "");
  const amountStr = String(formData.get("amount") || "0").replace(/[, ]/g, "");
  const cents = Math.round(Number(amountStr) * 100);

  if (!fromId || !toId || fromId === toId)
    throw new Error("Choose two different accounts.");
  if (!Number.isFinite(cents) || cents <= 0) throw new Error("Invalid amount.");

  const [from, to] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromId, userId } }),
    prisma.account.findFirst({ where: { id: toId, userId } }),
  ]);
  if (!from || !to) throw new Error("Account not found.");

  const agg = await prisma.transaction.aggregate({
    where: { accountId: fromId },
    _sum: { amount: true },
  });
  const fromBal = agg._sum.amount ?? 0;
  if (fromBal - cents < 0) throw new Error("Insufficient funds.");

  // Atomic double-entry
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId: fromId,
        userId,
        amount: -cents,
        // kind: "TRANSFER_OUT",
        // memo: `Transfer to ${to.name}`,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: toId,
        userId,
        amount: cents,
        // kind: "TRANSFER_IN",
        // memo: `Transfer from ${from.name}`,
      },
    }),
  ]);

  redirect(`/accounts/${fromId}`);
}

export default async function TransferPage() {
  const { user } = await requireSession();
  const accts = await prisma.account.findMany({
    where: { userId: user.id as string },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl border shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer</h1>
      <p className="text-gray-800 mb-6">
        Move money between your accounts instantly.
      </p>

      <form action={transfer} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-900 font-medium mb-1">From</label>
            <select
              name="fromId"
              className="w-full rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select account</option>
              {accts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} • {a.type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-900 font-medium mb-1">To</label>
            <select
              name="toId"
              className="w-full rounded border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select account</option>
              {accts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} • {a.type}
                </option>
              ))}
            </select>
          </div>
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
            placeholder="75.00"
            className="w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <SubmitButton className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
          Transfer
        </SubmitButton>
      </form>
    </div>
  );
}
