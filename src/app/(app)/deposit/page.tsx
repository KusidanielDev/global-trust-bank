import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function deposit(formData: FormData) {
  "use server";
  const accountId = String(formData.get("accountId"));
  const amount = parseFloat(String(formData.get("amount")));
  if (!accountId || !Number.isFinite(amount) || amount<=0) return;
  await prisma.transaction.create({
    data: {
      accountId,
      amount: amount,
      date: new Date(),
      description: "Deposit",
      category: "Deposit",
    },
  });
  // create notification
  await prisma.notification.create({
    data: {
      userId: (await import("@/lib/session").then(m=>m.requireSession())).user.id as string,
      title: `Deposit successful`,
      body: `Your deposit was received.`,
    }
  });

  redirect(`/accounts/${accountId}`);
}

export default async function DepositPage() {
  const accounts = await prisma.account.findMany({ select: { id: true }});
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Deposit</h1>
      <form action={deposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Account</label>
          <select name="accountId" className="mt-1 w-full border rounded p-2 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {accounts.map(a => <option key={a.id} value={a.id}>Account {a.id.slice(0,6)}…</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount (USD)</label>
          <input name="amount" type="number" step="0.01" min="0.01" className="mt-1 w-full border rounded p-2 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
        </div>
        <button className="w-full bg-black text-white rounded py-2">Deposit</button>
      </form>
    </div>
  );
}
